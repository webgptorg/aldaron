import {
    applyDatabaseMigrations,
    createMigrationFile,
    type MigrationDatabaseClient,
    type MigrationLogger,
} from '@/lib/database/migrateDatabase';
import { describe, expect, it, vi } from 'vitest';

const silentLogger: MigrationLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

function createFakeClient(recordedMigrations: Record<string, string> = {}): {
    readonly client: MigrationDatabaseClient;
    readonly executedSql: string[];
    readonly recorded: Record<string, string>;
} {
    const executedSql: string[] = [];
    const recorded = { ...recordedMigrations };

    const client: MigrationDatabaseClient = {
        query: vi.fn(async (queryText, values) => {
            executedSql.push(queryText);

            if (queryText.includes('SELECT name, checksum')) {
                return {
                    rows: Object.entries(recorded).map(([name, checksum]) => ({ name, checksum })),
                };
            }

            if (queryText.includes('INSERT INTO public._database_migrations')) {
                const [name, checksum] = values ?? [];
                recorded[String(name)] = String(checksum);
            }

            return { rows: [] };
        }),
        end: vi.fn(async () => undefined),
    };

    return { client, executedSql, recorded };
}

describe('applyDatabaseMigrations', () => {
    it('applies pending files in filename order and records their checksums', async () => {
        const { client, executedSql, recorded } = createFakeClient();
        const migrations = [
            createMigrationFile('2026-08-0200-second.sql', 'SELECT 2;'),
            createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;'),
        ];

        const result = await applyDatabaseMigrations(client, migrations, silentLogger);

        expect(result).toEqual({
            appliedMigrations: ['2026-08-0100-first.sql', '2026-08-0200-second.sql'],
            skipped: false,
        });
        expect(executedSql).toContain('SELECT 1;');
        expect(executedSql).toContain('SELECT 2;');
        expect(executedSql.indexOf('SELECT 1;')).toBeLessThan(executedSql.indexOf('SELECT 2;'));
        expect(Object.keys(recorded)).toEqual(['2026-08-0100-first.sql', '2026-08-0200-second.sql']);
    });

    it('does not run an already recorded migration again', async () => {
        const migration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;');
        const { client, executedSql } = createFakeClient({ [migration.name]: migration.checksum });

        const result = await applyDatabaseMigrations(client, [migration], silentLogger);

        expect(result.appliedMigrations).toEqual([]);
        expect(executedSql).not.toContain(migration.sql);
    });

    it('rejects a migration whose source changed after it was applied', async () => {
        const oldMigration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 1;');
        const changedMigration = createMigrationFile('2026-08-0100-first.sql', 'SELECT 99;');
        const { client } = createFakeClient({ [oldMigration.name]: oldMigration.checksum });

        await expect(applyDatabaseMigrations(client, [changedMigration], silentLogger)).rejects.toThrow(
            'was changed after it was applied',
        );
    });
});
