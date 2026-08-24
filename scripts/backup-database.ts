import 'dotenv/config';
import path from 'node:path';
import { backupDatabase } from '../lib/database/backupDatabase';

async function main(): Promise<void> {
    try {
        const result = await backupDatabase();
        const relativeFilePath = path.relative(process.cwd(), result.filePath) || result.filePath;

        console.info(`Database backup written to ${relativeFilePath}.`);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
