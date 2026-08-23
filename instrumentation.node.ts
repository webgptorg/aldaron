import { migrateDatabaseOnStartup } from './lib/database/migrateDatabase';

export async function registerNodeInstrumentation(): Promise<void> {
    await migrateDatabaseOnStartup();
}
