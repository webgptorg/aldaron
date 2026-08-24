import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
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

/**
 * Give the command that failed a practical, platform-appropriate way to install it, rather than a bare ENOENT.
 */
export function createPgDumpInstallationInstructions(platform: NodeJS.Platform = process.platform): string {
    const verification = 'Then open a new terminal and verify the installation with `pg_dump --version`.';

    if (platform === 'win32') {
        return [
            'Install the PostgreSQL command-line tools from https://www.postgresql.org/download/windows/.',
            'Add the installed PostgreSQL `bin` directory (for example, `C:\\Program Files\\PostgreSQL\\<version>\\bin`) to PATH.',
            verification,
        ].join('\n');
    }

    if (platform === 'darwin') {
        return [
            'With Homebrew, install the PostgreSQL client tools: `brew install libpq`.',
            'Add them to PATH: `echo \'export PATH="$(brew --prefix libpq)/bin:$PATH"\' >> ~/.zshrc`, then run `source ~/.zshrc`.',
            `Alternatively, use the installer at https://www.postgresql.org/download/macosx/.`,
            verification,
        ].join('\n');
    }

    return [
        'Install the PostgreSQL client package with your Linux distribution\'s package manager.',
        'For Debian or Ubuntu, run `sudo apt install postgresql-client`.',
        'For other distributions, see https://www.postgresql.org/download/linux/.',
        verification,
    ].join('\n');
}

function createPgDumpNotFoundError(): Error {
    return new Error(
        `Cannot back up the database: pg_dump was not found on PATH.\n${createPgDumpInstallationInstructions()}`,
    );
}

function runPgDump(command: string, argumentsList: readonly string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, argumentsList, { stdio: ['ignore', 'inherit', 'inherit'] });
        let settled = false;

        childProcess.once('error', (error: NodeJS.ErrnoException) => {
            if (settled) return;
            settled = true;

            if (error.code === 'ENOENT') {
                reject(createPgDumpNotFoundError());
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
