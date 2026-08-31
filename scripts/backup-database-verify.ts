import path from 'node:path';
import {
    type DatabaseBackupTable,
    type VerifyDatabaseBackupResult,
    verifyDatabaseBackup,
} from '../lib/database/verifyDatabaseBackup';

function formatRowCount(rowCount: number): string {
    return `${rowCount} ${rowCount === 1 ? 'row' : 'rows'}`;
}

function reportBackedUpTables(tables: readonly DatabaseBackupTable[]): void {
    if (tables.length === 0) {
        console.info('The archive contains no table data.');
        return;
    }

    console.info('Backed up tables:');

    for (const table of tables) {
        console.info(`- ${table.tableName}: ${formatRowCount(table.rowCount)}`);
    }
}

function reportVerifiedDatabaseBackup(result: VerifyDatabaseBackupResult): void {
    const relativeFilePath = path.relative(process.cwd(), result.filePath) || result.filePath;

    console.info(`Database backup is valid at ${relativeFilePath}.`);
    reportBackedUpTables(result.tables);
}

async function main(): Promise<void> {
    try {
        const result = await verifyDatabaseBackup();

        reportVerifiedDatabaseBackup(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error(`Database backup verification failed: ${errorMessage}`);
        process.exitCode = 1;
    }
}

void main();
