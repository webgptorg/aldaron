import { randomUUID } from 'node:crypto';
import { mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { requireDatabaseUrl } from './databaseUrl';

const DEFAULT_BACKUP_DIRECTORY = path.resolve(process.cwd(), 'backups');
const DEFAULT_PG_DUMP_COMMAND = process.platform === 'win32' ? 'pg_dump.exe' : 'pg_dump';

export type PgDumpRunner = (command: string, argumentsList: readonly string[]) => Promise<void>;

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

function runPgDump(command: string, argumentsList: readonly string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, argumentsList, { stdio: ['ignore', 'inherit', 'inherit'] });
        let settled = false;

        childProcess.once('error', (error: NodeJS.ErrnoException) => {
            if (settled) return;
            settled = true;

            if (error.code === 'ENOENT') {
                reject(
                    new Error(
                        'Cannot back up the database: pg_dump was not found on PATH. Install PostgreSQL client tools.',
                    ),
                );
                return;
            }

            reject(error);
        });

        childProcess.once('close', (exitCode, signal) => {
            if (settled) return;
            settled = true;

            if (exitCode === 0) {
                resolve();
                return;
            }

            if (signal !== null) {
                reject(new Error(`pg_dump was terminated by ${signal}.`));
                return;
            }

            reject(new Error(`pg_dump failed with exit code ${exitCode ?? 'unknown'}.`));
        });
    });
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
