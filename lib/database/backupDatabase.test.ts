import { mkdtemp, readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    backupDatabase,
    createBackupFileName,
    createPgDumpArguments,
    createPgDumpInstallationInstructions,
    type PgDumpRunner,
} from '@/lib/database/backupDatabase';
import {
    createPgRestoreArguments,
    createPgRestoreDataArguments,
    verifyDatabaseBackup,
    type PgRestoreRunner,
} from '@/lib/database/verifyDatabaseBackup';

const temporaryDirectories: string[] = [];

afterEach(async () => {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
    );
});

async function createTemporaryDirectory(): Promise<string> {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'aldaron-database-backup-'));
    temporaryDirectories.push(directory);
    return directory;
}

describe('createBackupFileName', () => {
    it('creates a filesystem-safe timestamped archive name', () => {
        expect(createBackupFileName(new Date('2026-08-23T21:22:23.456Z'))).toBe(
            'database-2026-08-23T21-22-23-456Z.dump',
        );
    });
});

describe('backupDatabase', () => {
    it('writes the archive only after pg_dump succeeds and passes the complete database URL', async () => {
        const backupDirectory = await createTemporaryDirectory();
        const runner: PgDumpRunner = vi.fn(async (_command, argumentsList) => {
            const outputPath = argumentsList[argumentsList.indexOf('--file') + 1];
            await writeFile(outputPath, 'database archive');
        });

        const result = await backupDatabase({
            databaseUrl: 'postgresql://user:password@example.test/database',
            backupDirectory,
            backupFileName: 'database-test.dump',
            pgDumpCommand: 'pg_dump-test',
            runPgDump: runner,
        });

        expect(result).toEqual({
            fileName: 'database-test.dump',
            filePath: path.join(backupDirectory, 'database-test.dump'),
        });
        expect(runner).toHaveBeenCalledWith(
            'pg_dump-test',
            expect.arrayContaining([
                '--dbname',
                'postgresql://user:password@example.test/database',
                '--format=custom',
                '--file',
            ]),
        );
        await expect(readFile(result.filePath, 'utf8')).resolves.toBe('database archive');
    });

    it('removes a partial archive when pg_dump fails', async () => {
        const backupDirectory = await createTemporaryDirectory();
        const runner: PgDumpRunner = vi.fn(async (_command, argumentsList) => {
            const outputPath = argumentsList[argumentsList.indexOf('--file') + 1];
            await writeFile(outputPath, 'partial archive');
            throw new Error('pg_dump failed');
        });

        await expect(
            backupDatabase({
                databaseUrl: 'postgresql://example.test/database',
                backupDirectory,
                backupFileName: 'database-test.dump',
                runPgDump: runner,
            }),
        ).rejects.toThrow('pg_dump failed');
        await expect(readFile(path.join(backupDirectory, 'database-test.dump'))).rejects.toThrow();
        await expect(readdir(backupDirectory)).resolves.toEqual([]);
    });

    it('refuses to run without DATABASE_URL', async () => {
        const runner = vi.fn();

        await expect(backupDatabase({ databaseUrl: '', runPgDump: runner })).rejects.toThrow(
            'DATABASE_URL is not configured',
        );
        expect(runner).not.toHaveBeenCalled();
    });

    it('explains how to install pg_dump when it is missing', async () => {
        const backupDirectory = await createTemporaryDirectory();

        await expect(
            backupDatabase({
                databaseUrl: 'postgresql://example.test/database',
                backupDirectory,
                pgDumpCommand: `missing-pg-dump-${Date.now()}`,
            }),
        ).rejects.toThrow('pg_dump was not found on PATH');
    });
});

describe('createPgDumpArguments', () => {
    it('uses pg_dump custom format so schema, data, and database objects are preserved', () => {
        expect(createPgDumpArguments('postgresql://example.test/database', '/tmp/database.dump')).toEqual([
            '--dbname',
            'postgresql://example.test/database',
            '--format=custom',
            '--file',
            '/tmp/database.dump',
        ]);
    });
});

describe('createPgDumpInstallationInstructions', () => {
    it('explains how to install pg_dump on Windows, macOS, and Linux', () => {
        expect(createPgDumpInstallationInstructions('win32')).toContain('download/windows');
        expect(createPgDumpInstallationInstructions('darwin')).toContain('brew install libpq');
        expect(createPgDumpInstallationInstructions('linux')).toContain('apt install postgresql-client');
    });
});

describe('verifyDatabaseBackup', () => {
    it('verifies the newest completed archive, counts its rows, and ignores temporary files', async () => {
        const backupDirectory = await createTemporaryDirectory();
        const olderBackupPath = path.join(backupDirectory, 'database-older.dump');
        const newestBackupPath = path.join(backupDirectory, 'database-newest.dump');
        await writeFile(olderBackupPath, 'older archive');
        await writeFile(newestBackupPath, 'newest archive');
        await writeFile(path.join(backupDirectory, 'database-newest.dump.tmp-interrupted'), 'partial archive');
        await utimes(olderBackupPath, new Date('2026-08-20T12:00:00Z'), new Date('2026-08-20T12:00:00Z'));
        await utimes(newestBackupPath, new Date('2026-08-21T12:00:00Z'), new Date('2026-08-21T12:00:00Z'));
        const runner: PgRestoreRunner = vi.fn(async (_command, argumentsList, handleStandardOutput) => {
            if (!argumentsList.includes('--data-only')) {
                return;
            }

            handleStandardOutput?.(Buffer.from('COPY public."Contact" (id, fullname) F'));
            handleStandardOutput?.(Buffer.from('ROM stdin;\nfirst\nsecond\n\\.\nCOPY public.workshops (id) FROM stdin;\n\\.\n'));
        });

        const result = await verifyDatabaseBackup({
            backupDirectory,
            pgRestoreCommand: 'pg_restore-test',
            runPgRestore: runner,
        });

        expect(result).toEqual({
            fileName: 'database-newest.dump',
            filePath: newestBackupPath,
            tables: [
                { tableName: 'public."Contact"', rowCount: 2 },
                { tableName: 'public.workshops', rowCount: 0 },
            ],
        });
        expect(runner).toHaveBeenNthCalledWith(1, 'pg_restore-test', ['--list', newestBackupPath]);
        expect(runner).toHaveBeenNthCalledWith(
            2,
            'pg_restore-test',
            ['--data-only', '--file=-', newestBackupPath],
            expect.any(Function),
        );
    });

    it('refuses to verify when no completed archive exists', async () => {
        const backupDirectory = await createTemporaryDirectory();
        const runner = vi.fn();
        await writeFile(path.join(backupDirectory, 'database.dump.tmp-interrupted'), 'partial archive');

        await expect(verifyDatabaseBackup({ backupDirectory, runPgRestore: runner })).rejects.toThrow(
            'no completed .dump archive was found',
        );
        expect(runner).not.toHaveBeenCalled();
    });

    it('explains how to install pg_restore when it is missing', async () => {
        const backupDirectory = await createTemporaryDirectory();
        await writeFile(path.join(backupDirectory, 'database-test.dump'), 'database archive');

        await expect(
            verifyDatabaseBackup({
                backupDirectory,
                pgRestoreCommand: `missing-pg-restore-${Date.now()}`,
            }),
        ).rejects.toThrow('pg_restore was not found on PATH');
    });
});

describe('createPgRestoreArguments', () => {
    it('lists the archive contents without restoring into a database', () => {
        expect(createPgRestoreArguments('/tmp/database.dump')).toEqual(['--list', '/tmp/database.dump']);
    });

    it('writes the complete data section to standard output for row counting', () => {
        expect(createPgRestoreDataArguments('/tmp/database.dump')).toEqual([
            '--data-only',
            '--file=-',
            '/tmp/database.dump',
        ]);
    });
});
