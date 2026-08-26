import { randomUUID } from 'node:crypto';
import { mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { requireDatabaseUrl } from './databaseUrl';
import {
    createPostgresClientCommand,
    createPostgresClientInstallationInstructions,
    createPostgresCommandRunner,
    type PostgresCommandRunner,
} from './postgresCli';

export const DEFAULT_BACKUP_DIRECTORY = path.resolve(process.cwd(), 'backups');
const DEFAULT_PG_DUMP_COMMAND = createPostgresClientCommand('pg_dump');
const runPgDump = createPostgresCommandRunner({ operation: 'back up the database', tool: 'pg_dump' });

export type PgDumpRunner = PostgresCommandRunner;

export type BackupDatabaseOptions = {
    readonly databaseUrl?: string | null;
    readonly backupDirectory?: string;
    readonly backupFileName?: string;
    readonly now?: () => Date;
    readonly pgDumpCommand?: string;
    readonly runPgDump?: PgDumpRunner;
};

export type BackupDatabaseResult = {
    readonly fileName: string;
    readonly filePath: string;
};

/**
 * Create a filesystem-safe name for a PostgreSQL custom-format archive.
 */
export function createBackupFileName(date: Date = new Date()): string {
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    return `database-${timestamp}.dump`;
}

export function createPgDumpArguments(databaseUrl: string, outputPath: string): readonly string[] {
    return ['--dbname', databaseUrl, '--format=custom', '--file', outputPath];
}

export function createPgDumpInstallationInstructions(platform: NodeJS.Platform = process.platform): string {
    return createPostgresClientInstallationInstructions('pg_dump', platform);
}

/**
 * Back up the complete database addressed by DATABASE_URL into a timestamped custom-format archive.
 *
 * pg_dump writes to a unique temporary file first. The final archive only appears after pg_dump succeeds, so a
 * failed backup cannot look like a usable backup to the next person restoring the backups directory.
 */
export async function backupDatabase(options: BackupDatabaseOptions = {}): Promise<BackupDatabaseResult> {
    const databaseUrl = requireDatabaseUrl(options.databaseUrl, 'back up the database');
    const backupDirectory = path.resolve(options.backupDirectory ?? DEFAULT_BACKUP_DIRECTORY);
    const fileName = options.backupFileName ?? createBackupFileName(options.now?.());
    const filePath = path.join(backupDirectory, fileName);
    const temporaryFilePath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;

    await mkdir(backupDirectory, { recursive: true });

    try {
        await (options.runPgDump ?? runPgDump)(
            options.pgDumpCommand ?? DEFAULT_PG_DUMP_COMMAND,
            createPgDumpArguments(databaseUrl, temporaryFilePath),
        );
        await rename(temporaryFilePath, filePath);

        return { fileName, filePath };
    } finally {
        await unlink(temporaryFilePath).catch(() => undefined);
    }
}
