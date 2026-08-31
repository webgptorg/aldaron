import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_BACKUP_DIRECTORY } from './backupDatabase';
import {
    createPostgresClientCommand,
    createPostgresCommandRunner,
    type PostgresCommandRunner,
    type PostgresCommandStandardOutputHandler,
} from './postgresCli';

const BACKUP_ARCHIVE_EXTENSION = '.dump';
const COPY_COMMAND_PREFIX = 'COPY ';
const COPY_COMMAND_SUFFIX = ' FROM stdin;';
const COPY_DATA_END_MARKER = '\\.';
const DEFAULT_PG_RESTORE_COMMAND = createPostgresClientCommand('pg_restore');
const PG_RESTORE_DATA_ONLY_ARGUMENT = '--data-only';
const PG_RESTORE_LIST_ARGUMENT = '--list';
const PG_RESTORE_STANDARD_OUTPUT_ARGUMENT = '--file=-';
const STANDARD_OUTPUT_LINE_BREAK_PATTERN = /\r?\n/;
const runPgRestore = createPostgresCommandRunner({ operation: 'verify the database backup', tool: 'pg_restore' });

export type PgRestoreRunner = PostgresCommandRunner;

export type VerifyDatabaseBackupOptions = {
    readonly backupDirectory?: string;
    readonly pgRestoreCommand?: string;
    readonly runPgRestore?: PgRestoreRunner;
};

export type DatabaseBackupArchive = {
    readonly fileName: string;
    readonly filePath: string;
};

export type DatabaseBackupTable = {
    readonly tableName: string;
    readonly rowCount: number;
};

export type VerifyDatabaseBackupResult = DatabaseBackupArchive & {
    readonly tables: readonly DatabaseBackupTable[];
};

type BackupArchiveCandidate = DatabaseBackupArchive & {
    readonly modifiedAt: number;
};

type DatabaseBackupTableRowCounter = {
    readonly handleStandardOutput: PostgresCommandStandardOutputHandler;
    readonly finish: () => readonly DatabaseBackupTable[];
};

export function createPgRestoreArguments(backupFilePath: string): readonly string[] {
    return [PG_RESTORE_LIST_ARGUMENT, backupFilePath];
}

export function createPgRestoreDataArguments(backupFilePath: string): readonly string[] {
    return [PG_RESTORE_DATA_ONLY_ARGUMENT, PG_RESTORE_STANDARD_OUTPUT_ARGUMENT, backupFilePath];
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
): Promise<DatabaseBackupArchive> {
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

function isCopyCommand(outputLine: string): boolean {
    return outputLine.startsWith(COPY_COMMAND_PREFIX) && outputLine.endsWith(COPY_COMMAND_SUFFIX);
}

function findCopyCommandColumnListStart(tableWithColumns: string): number {
    let isWithinQuotedIdentifier = false;

    for (let characterIndex = 0; characterIndex < tableWithColumns.length; characterIndex++) {
        const character = tableWithColumns[characterIndex];

        if (character === '"') {
            if (isWithinQuotedIdentifier && tableWithColumns[characterIndex + 1] === '"') {
                characterIndex += 1;
                continue;
            }

            isWithinQuotedIdentifier = !isWithinQuotedIdentifier;
            continue;
        }

        if (!isWithinQuotedIdentifier && character === ' ' && tableWithColumns[characterIndex + 1] === '(') {
            return characterIndex;
        }
    }

    return -1;
}

function readCopyCommandTableName(copyCommand: string): string | undefined {
    const tableWithColumns = copyCommand.slice(COPY_COMMAND_PREFIX.length, -COPY_COMMAND_SUFFIX.length);
    const columnListStart = findCopyCommandColumnListStart(tableWithColumns);
    const tableName = (columnListStart === -1 ? tableWithColumns : tableWithColumns.slice(0, columnListStart)).trim();

    return tableName === '' ? undefined : tableName;
}

function createIncompleteTableDataError(tableName: string): Error {
    return new Error(`Cannot verify the database backup: archived data for ${tableName} did not end correctly.`);
}

function createUnrecognizedCopyCommandError(): Error {
    return new Error('Cannot verify the database backup: pg_restore emitted an unrecognized table-data command.');
}

function createDatabaseBackupTableRowCounter(): DatabaseBackupTableRowCounter {
    const rowCountsByTableName = new Map<string, number>();
    let currentTableName: string | undefined;
    let incompleteOutputLine = '';
    let inspectionError: Error | undefined;

    function processOutputLine(outputLine: string): void {
        if (inspectionError !== undefined) {
            return;
        }

        const normalizedOutputLine = outputLine.endsWith('\r') ? outputLine.slice(0, -1) : outputLine;
        const tableName = currentTableName;

        if (tableName !== undefined) {
            if (normalizedOutputLine === COPY_DATA_END_MARKER) {
                currentTableName = undefined;
                return;
            }

            const rowCount = rowCountsByTableName.get(tableName);

            if (rowCount === undefined) {
                inspectionError = createIncompleteTableDataError(tableName);
                return;
            }

            rowCountsByTableName.set(tableName, rowCount + 1);
            return;
        }

        if (!isCopyCommand(normalizedOutputLine)) {
            return;
        }

        const copyCommandTableName = readCopyCommandTableName(normalizedOutputLine);

        if (copyCommandTableName === undefined) {
            inspectionError = createUnrecognizedCopyCommandError();
            return;
        }

        currentTableName = copyCommandTableName;
        rowCountsByTableName.set(copyCommandTableName, rowCountsByTableName.get(copyCommandTableName) ?? 0);
    }

    function handleStandardOutput(standardOutputChunk: Buffer): void {
        incompleteOutputLine += standardOutputChunk.toString();
        const outputLines = incompleteOutputLine.split(STANDARD_OUTPUT_LINE_BREAK_PATTERN);
        incompleteOutputLine = outputLines.pop() ?? '';

        for (const outputLine of outputLines) {
            processOutputLine(outputLine);
        }
    }

    function finish(): readonly DatabaseBackupTable[] {
        if (incompleteOutputLine !== '') {
            processOutputLine(incompleteOutputLine);
        }

        if (inspectionError !== undefined) {
            throw inspectionError;
        }

        if (currentTableName !== undefined) {
            throw createIncompleteTableDataError(currentTableName);
        }

        return Array.from(rowCountsByTableName, ([tableName, rowCount]) => ({ tableName, rowCount })).sort((left, right) =>
            left.tableName.localeCompare(right.tableName),
        );
    }

    return { handleStandardOutput, finish };
}

/**
 * Check that pg_restore can read the catalogue and every table-data section of the latest completed custom-format
 * archive without connecting to or changing a database. A full restore drill remains the separate way to verify
 * recovery of application data.
 */
export async function verifyDatabaseBackup(
    options: VerifyDatabaseBackupOptions = {},
): Promise<VerifyDatabaseBackupResult> {
    const backup = await findLatestDatabaseBackup(options.backupDirectory);
    const restoreRunner = options.runPgRestore ?? runPgRestore;
    const tableRowCounter = createDatabaseBackupTableRowCounter();
    const pgRestoreCommand = options.pgRestoreCommand ?? DEFAULT_PG_RESTORE_COMMAND;

    await restoreRunner(pgRestoreCommand, createPgRestoreArguments(backup.filePath));
    await restoreRunner(
        pgRestoreCommand,
        createPgRestoreDataArguments(backup.filePath),
        tableRowCounter.handleStandardOutput,
    );

    return { ...backup, tables: tableRowCounter.finish() };
}
