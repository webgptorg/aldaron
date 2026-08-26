import path from 'node:path';
import { verifyDatabaseBackup } from '../lib/database/verifyDatabaseBackup';

async function main(): Promise<void> {
    try {
        const result = await verifyDatabaseBackup();
        const relativeFilePath = path.relative(process.cwd(), result.filePath) || result.filePath;

        console.info(`Database backup verified at ${relativeFilePath}.`);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
