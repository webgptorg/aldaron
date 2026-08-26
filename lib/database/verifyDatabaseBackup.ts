import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_BACKUP_DIRECTORY } from './backupDatabase';
import {
    createPostgresClientCommand,
    createPostgresCommandRunner,
    type PostgresCommandRunner,
} from './postgresCli';

const BACKUP_ARCHIVE_EXTENSION = '.dump';
const DEFAULT_PG_RESTORE_COMMAND = createPostgresClientCommand('pg_restore');
const runPgRestore = createPostgresCommandRunner({ operation: 'verify the database backup', tool: 'pg_restore' });

export type PgRestoreRunner = PostgresCommandRunner;

export type VerifyDatabaseBackupOptions = {
    readonly backupDirectory?: string;
    readonly pgRestoreCommand?: string;
    readonly runPgRestore?: PgRestoreRunner;
};

export type VerifyDatabaseBackupResult = {
    readonly fileName: string;
    readonly filePath: string;
};

type BackupArchiveCandidate = VerifyDatabaseBackupResult & {
    readonly modifiedAt: number;
};

export function createPgRestoreArguments(backupFilePath: string): readonly string[] {
    return ['--list', backupFilePath];
}

function createNoDatabaseBackupError(backupDirectory: string): Error {
    const relativeBackupDirectory = path.relative(process.cwd(), backupDirectory) || backupDirectory;

    return new Error(
        `Cannot verify the database backup: no completed ${BACKUP_ARCHIVE_EXTENSION} archive was found in ${relativeBackupDirectory}. Run \`npm run backup-database\` first.`,
    );
}

async function readBackupDirectory(backupDirectory: string) {
    try {
        return await readdir(backupDirectory, { withFileTypes: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            throw createNoDatabaseBackupError(backupDirectory);
        }

        throw error;
    }
}

/**
 * Find the most recently completed archive. Temporary files are deliberately excluded because backupDatabase only
 * gives a successful dump its final .dump name after pg_dump exits successfully.
 */
export async function findLatestDatabaseBackup(
    backupDirectory: string = DEFAULT_BACKUP_DIRECTORY,
): Promise<VerifyDatabaseBackupResult> {
    const resolvedBackupDirectory = path.resolve(backupDirectory);
    const entries = await readBackupDirectory(resolvedBackupDirectory);

    const candidates = await Promise.all(
        entries
            .filter((entry) => entry.isFile() && path.extname(entry.name) === BACKUP_ARCHIVE_EXTENSION)
            .map(async (entry): Promise<BackupArchiveCandidate> => {
                const filePath = path.join(resolvedBackupDirectory, entry.name);
                const fileStats = await stat(filePath);

                return { fileName: entry.name, filePath, modifiedAt: fileStats.mtimeMs };
            }),
    );
    const latestBackup = candidates.sort(
        (left, right) => right.modifiedAt - left.modifiedAt || right.fileName.localeCompare(left.fileName),
    )[0];

    if (latestBackup === undefined) {
        throw createNoDatabaseBackupError(resolvedBackupDirectory);
    }

    return { fileName: latestBackup.fileName, filePath: latestBackup.filePath };
}

/**
 * Check that pg_restore can read the catalogue of the latest completed custom-format archive without connecting to
 * or changing a database. A full restore drill remains the separate way to verify recovery of application data.
 */
export async function verifyDatabaseBackup(
    options: VerifyDatabaseBackupOptions = {},
): Promise<VerifyDatabaseBackupResult> {
    const backup = await findLatestDatabaseBackup(options.backupDirectory);

    await (options.runPgRestore ?? runPgRestore)(
        options.pgRestoreCommand ?? DEFAULT_PG_RESTORE_COMMAND,
        createPgRestoreArguments(backup.filePath),
    );

    return backup;
}
