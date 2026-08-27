import { requireDatabaseUrl } from '@/lib/database/databaseUrl';
import { Client, type QueryResultRow } from 'pg';

const BEGIN_TRANSACTION_SQL = 'BEGIN;';
const COMMIT_TRANSACTION_SQL = 'COMMIT;';
const ROLLBACK_TRANSACTION_SQL = 'ROLLBACK;';

export type DatabaseQueryResult<Row extends QueryResultRow> = {
    readonly rows: readonly Row[];
};

/**
 * The deliberately small part of a PostgreSQL transaction a backend service needs. Keeping it independent of `pg`
 * makes business rules straightforward to exercise without a live database.
 */
export type DatabaseTransaction = {
    readonly query: <Row extends QueryResultRow>(
        queryText: string,
        values?: readonly unknown[],
    ) => Promise<DatabaseQueryResult<Row>>;
};

function createDatabaseTransaction(client: Client): DatabaseTransaction {
    return {
        query: async <Row extends QueryResultRow>(queryText: string, values?: readonly unknown[]) => {
            const result =
                values === undefined
                    ? await client.query<Row>(queryText)
                    : await client.query<Row>(queryText, [...values]);

            return { rows: result.rows };
        },
    };
}

/**
 * Runs a short backend-owned PostgreSQL transaction. Database functions stay unnecessary while related writes still
 * either all succeed or all roll back together.
 */
export async function runDatabaseTransaction<Result>(
    operation: string,
    runInTransaction: (transaction: DatabaseTransaction) => Promise<Result>,
): Promise<Result> {
    const databaseUrl = requireDatabaseUrl(undefined, operation);
    const client = new Client({ connectionString: databaseUrl });
    let isClientConnected = false;
    let isTransactionStarted = false;

    try {
        await client.connect();
        isClientConnected = true;
        await client.query(BEGIN_TRANSACTION_SQL);
        isTransactionStarted = true;

        const result = await runInTransaction(createDatabaseTransaction(client));

        await client.query(COMMIT_TRANSACTION_SQL);
        isTransactionStarted = false;
        return result;
    } catch (error) {
        if (isTransactionStarted) {
            try {
                await client.query(ROLLBACK_TRANSACTION_SQL);
            } catch (rollbackError) {
                console.error(
                    `Could not roll back the failed ${operation} transaction: ${
                        rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
                    }`,
                );
            }
        }

        throw error;
    } finally {
        if (isClientConnected) {
            await client.end();
        }
    }
}
