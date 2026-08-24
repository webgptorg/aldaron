import 'dotenv/config';
import { E2E_TEST_EMAIL_SQL_PATTERN } from '@/lib/e2e/testData';
import { requireDatabaseUrl } from '@/lib/database/databaseUrl';
import { Client } from 'pg';

type DeletedTestDataCounts = {
    readonly contacts: string;
    readonly workshopParticipants: string;
};

const DELETE_TEST_DATA_SQL = `
WITH deleted_workshop_participants AS (
    DELETE FROM public.workshop_participants
    WHERE email ILIKE $1
    RETURNING 1
),
deleted_contacts AS (
    DELETE FROM public."Contact"
    WHERE "email" ILIKE $1
    RETURNING 1
)
SELECT
    (SELECT count(*) FROM deleted_contacts) AS "contacts",
    (SELECT count(*) FROM deleted_workshop_participants) AS "workshopParticipants";`;

/**
 * Delete data created by the public E2E forms. Removing a participant also
 * removes its dependent workshop activity through the database's cascades.
 */
async function deleteTestData(): Promise<DeletedTestDataCounts> {
    const client = new Client({ connectionString: requireDatabaseUrl(undefined, 'delete E2E test data') });

    try {
        await client.connect();
        const result = await client.query<DeletedTestDataCounts>(DELETE_TEST_DATA_SQL, [E2E_TEST_EMAIL_SQL_PATTERN]);
        const deletedCounts = result.rows[0];

        if (deletedCounts === undefined) {
            throw new Error('The database did not return the E2E deletion counts.');
        }

        return deletedCounts;
    } finally {
        await client.end().catch(() => undefined);
    }
}

async function main(): Promise<void> {
    try {
        const deletedCounts = await deleteTestData();
        console.info(
            `Deleted ${deletedCounts.contacts} Contact row(s) and ${deletedCounts.workshopParticipants} workshop participant row(s) with an @example.com e-mail address.`,
        );
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
