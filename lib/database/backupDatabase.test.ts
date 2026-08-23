import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    backupDatabase,
    createBackupFileName,
    createPgDumpArguments,
    type PgDumpRunner,
} from '@/lib/database/backupDatabase';

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

    it('refuses to run without DATABASE_URL', async () => {
        const runner = vi.fn();

        await expect(backupDatabase({ databaseUrl: '', runPgDump: runner })).rejects.toThrow(
            'DATABASE_URL is not configured',
        );
        expect(runner).not.toHaveBeenCalled();
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
