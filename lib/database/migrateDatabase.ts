import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

const DATABASE_URL_ENVIRONMENT_VARIABLE = 'DATABASE_URL';
const DATABASE_MIGRATIONS_TABLE = 'public._database_migrations';
const DEFAULT_MIGRATIONS_DIRECTORY = path.resolve(process.cwd(), 'migrations');

// The lock is transaction-scoped on purpose. This also works with Supabase's transaction pooler, where a
// session-scoped advisory lock could be released when the pooler moves the next statement to another connection.
const DATABASE_MIGRATIONS_ADVISORY_LOCK_KEY = '734119762104';

const CREATE_DATABASE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ${DATABASE_MIGRATIONS_TABLE} (
    name text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
);`;

const READ_APPLIED_MIGRATIONS_SQL = `
SELECT name, checksum
FROM ${DATABASE_MIGRATIONS_TABLE}
ORDER BY name;`;

const RECORD_MIGRATION_SQL = `
INSERT INTO ${DATABASE_MIGRATIONS_TABLE} (name, checksum)
VALUES ($1, $2);`;

const BEGIN_SQL = 'BEGIN;';
const COMMIT_SQL = 'COMMIT;';
const ROLLBACK_SQL = 'ROLLBACK;';

export type MigrationLogger = {
    readonly info: (message: string) => void;
    readonly warn: (message: string) => void;
    readonly error: (message: string) => void;
};

export type MigrationFile = {
    readonly name: string;
    readonly sql: string;
    readonly checksum: string;
};

export type MigrationDatabaseClient = {
    readonly query: (
        queryText: string,
        values?: readonly unknown[],
    ) => Promise<{ readonly rows: readonly Record<string, unknown>[] }>;
    readonly end: () => Promise<void>;
};

export type MigrationDatabaseResult = {
    readonly appliedMigrations: readonly string[];
    readonly skipped: boolean;
};

export type MigrateDatabaseOptions = {
    readonly databaseUrl?: string | null;
    readonly migrationsDirectory?: string;
    readonly missingDatabaseUrl?: 'skip' | 'throw';
    readonly clientFactory?: (databaseUrl: string) => Promise<MigrationDatabaseClient>;
    readonly logger?: MigrationLogger;
};

const DEFAULT_LOGGER: MigrationLogger = {
    info: (message) => console.info(message),
    warn: (message) => console.warn(message),
    error: (message) => console.error(message),
};

/**
 * Turn a migration's source into the immutable value recorded in the database.
 * A changed migration is an error: once a migration has run, a new migration must be added instead of rewriting it.
 */
export function createMigrationFile(name: string, sql: string): MigrationFile {
    return {
        name,
        sql,
        checksum: createHash('sha256').update(sql, 'utf8').digest('hex'),
    };
}

/**
 * Read every SQL migration in filename order. The order is deliberately based on the complete filename, including
 * suffixes such as `-0`, `-1`, and `-2`, because those suffixes are part of the existing migration naming convention.
 */
export async function readMigrationFiles(
    migrationsDirectory: string = DEFAULT_MIGRATIONS_DIRECTORY,
): Promise<readonly MigrationFile[]> {
    const entries = await readdir(migrationsDirectory, { withFileTypes: true });
    const migrationNames = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
        .map((entry) => entry.name)
        .sort();

    return Promise.all(
        migrationNames.map(async (name) => createMigrationFile(name, await readFile(path.join(migrationsDirectory, name), 'utf8'))),
    );
}

function removeTransactionWrapper(sql: string): string {
    // The existing files are also run by hand in Supabase SQL Editor, so they carry their own BEGIN/COMMIT. Remove
    // only those outer statements while the runner supplies one transaction for the migration and its bookkeeping.
    return sql
        .replace(/^\uFEFF?\s*BEGIN(?:\s+TRANSACTION)?\s*;\s*/i, '')
        .replace(/\s*COMMIT\s*;\s*$/i, '');
}

function sortAndValidateMigrationFiles(migrations: readonly MigrationFile[]): readonly MigrationFile[] {
    const orderedMigrations = [...migrations].sort((left, right) => {
        if (left.name < right.name) return -1;
        if (left.name > right.name) return 1;
        return 0;
    });
    const names = new Set<string>();

    for (const migration of orderedMigrations) {
        if (names.has(migration.name)) {
            throw new Error(`Duplicate database migration filename: ${migration.name}`);
        }
        names.add(migration.name);
    }

    return orderedMigrations;
}

function readAppliedMigrations(rows: readonly Record<string, unknown>[]): Map<string, string> {
    const appliedMigrations = new Map<string, string>();

    for (const row of rows) {
        if (typeof row.name !== 'string' || typeof row.checksum !== 'string') {
            throw new Error(`The ${DATABASE_MIGRATIONS_TABLE} table contains an invalid migration record.`);
        }

        appliedMigrations.set(row.name, row.checksum);
    }

    return appliedMigrations;
}

/**
 * Apply migrations using an already connected database client.
 *
 * The advisory lock, migration SQL, and bookkeeping all share one transaction. That makes a failed migration roll
 * back cleanly and prevents two app instances from applying the same migration concurrently.
 */
export async function applyDatabaseMigrations(
    client: MigrationDatabaseClient,
    migrations: readonly MigrationFile[],
    logger: MigrationLogger = DEFAULT_LOGGER,
): Promise<MigrationDatabaseResult> {
    const orderedMigrations = sortAndValidateMigrationFiles(migrations);
    const appliedMigrations: string[] = [];
    let transactionStarted = false;

    try {
        await client.query(BEGIN_SQL);
        transactionStarted = true;

        await client.query('SELECT pg_advisory_xact_lock($1::bigint);', [DATABASE_MIGRATIONS_ADVISORY_LOCK_KEY]);
        await client.query(CREATE_DATABASE_MIGRATIONS_TABLE_SQL);

        const appliedRows = await client.query(READ_APPLIED_MIGRATIONS_SQL);
        const recordedMigrations = readAppliedMigrations(appliedRows.rows);
        const availableMigrationNames = new Set(orderedMigrations.map((migration) => migration.name));

        recordedMigrations.forEach((_checksum, recordedMigrationName) => {
            if (!availableMigrationNames.has(recordedMigrationName)) {
                throw new Error(
                    `The database records migration "${recordedMigrationName}", but that file is not present in migrations/.`,
                );
            }
        });

        for (const migration of orderedMigrations) {
            const recordedChecksum = recordedMigrations.get(migration.name);

            if (recordedChecksum !== undefined) {
                if (recordedChecksum !== migration.checksum) {
                    throw new Error(
                        `Database migration "${migration.name}" was changed after it was applied. Add a new migration instead.`,
                    );
                }
                continue;
            }

            logger.info(`Applying database migration "${migration.name}"...`);
            await client.query(removeTransactionWrapper(migration.sql));
            await client.query(RECORD_MIGRATION_SQL, [migration.name, migration.checksum]);
            appliedMigrations.push(migration.name);
            logger.info(`Applied database migration "${migration.name}".`);
        }

        await client.query(COMMIT_SQL);
        transactionStarted = false;

        return { appliedMigrations, skipped: false };
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query(ROLLBACK_SQL);
            } catch (rollbackError) {
                logger.error(
                    `Could not roll back the failed database migration transaction: ${
                        rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
                    }`,
                );
            }
        }

        throw error;
    }
}

async function createPostgresClient(databaseUrl: string): Promise<MigrationDatabaseClient> {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();

    return {
        query: async (queryText, values) => {
            const result = values === undefined ? await client.query(queryText) : await client.query(queryText, [...values]);
            return { rows: result.rows as readonly Record<string, unknown>[] };
        },
        end: () => client.end(),
    };
}

/**
 * Apply all pending migrations from `migrations/`.
 *
 * The same function is used by the Next.js startup hook and by the command-line script. The only difference is what
 * they do when DATABASE_URL is absent: a local development server may continue without a database, while the explicit
 * migration command should fail loudly and production startup should not silently serve an outdated schema.
 */
export async function migrateDatabase(options: MigrateDatabaseOptions = {}): Promise<MigrationDatabaseResult> {
    const logger = options.logger ?? DEFAULT_LOGGER;
    const databaseUrl = options.databaseUrl ?? process.env[DATABASE_URL_ENVIRONMENT_VARIABLE];
    const missingDatabaseUrl = options.missingDatabaseUrl ?? 'throw';

    if (databaseUrl === undefined || databaseUrl.trim() === '') {
        if (missingDatabaseUrl === 'skip') {
            logger.warn(`Database migrations skipped: ${DATABASE_URL_ENVIRONMENT_VARIABLE} is not configured.`);
            return { appliedMigrations: [], skipped: true };
        }

        throw new Error(`Cannot migrate the database: ${DATABASE_URL_ENVIRONMENT_VARIABLE} is not configured.`);
    }

    const migrations = await readMigrationFiles(options.migrationsDirectory);
    const client = await (options.clientFactory ?? createPostgresClient)(databaseUrl);

    try {
        return await applyDatabaseMigrations(client, migrations, logger);
    } finally {
        await client.end();
    }
}

let startupMigrationPromise: Promise<MigrationDatabaseResult> | undefined;

/**
 * Run migrations once for the lifetime of a Node.js Next.js server process.
 */
export function migrateDatabaseOnStartup(): Promise<MigrationDatabaseResult> {
    if (startupMigrationPromise === undefined) {
        startupMigrationPromise = migrateDatabase({
            missingDatabaseUrl: process.env.NODE_ENV === 'production' ? 'throw' : 'skip',
        });
    }

    return startupMigrationPromise;
}
