import 'dotenv/config';
import { deleteCommunityParticipantWithProjectVotesInTransaction } from '@/lib/community-projects/communityProjectService';
import { runDatabaseTransaction, type DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { E2E_TEST_EMAIL_SQL_PATTERN } from '@/lib/e2e/testData';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';

type DeletedTestDataCounts = {
    readonly contacts: string;
    readonly workshopParticipants: string;
};

type TestCommunityParticipantRow = {
    readonly id: string;
};

type DeletedRemainingTestDataCounts = {
    readonly contacts: string;
    readonly workshopParticipants: string;
};

const TEST_COMMUNITY_PARTICIPANT_IDS_SQL = `
SELECT community_participant.id
FROM public.${WORKSHOP_PARTICIPANT_TABLE_NAME} AS community_participant
INNER JOIN public.${WORKSHOP_TABLE_NAME} AS community_room
    ON community_room.id = community_participant.workshop_id
WHERE community_participant.email ILIKE $1
  AND community_room.room_kind = 'community'
ORDER BY community_participant.id
FOR UPDATE OF community_participant;`;

const DELETE_TEST_DATA_SQL = `
WITH deleted_workshop_participants AS (
    DELETE FROM public.${WORKSHOP_PARTICIPANT_TABLE_NAME}
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

function addDeletedRowCount(deletedRowCount: string, additionalCount: number): string {
    return (BigInt(deletedRowCount) + BigInt(additionalCount)).toString();
}

async function deleteTestCommunityParticipants(
    transaction: DatabaseTransaction,
    emailPattern: string,
): Promise<number> {
    const { rows: communityParticipants } = await transaction.query<TestCommunityParticipantRow>(
        TEST_COMMUNITY_PARTICIPANT_IDS_SQL,
        [emailPattern],
    );

    for (const communityParticipant of communityParticipants) {
        await deleteCommunityParticipantWithProjectVotesInTransaction(transaction, communityParticipant.id);
    }

    return communityParticipants.length;
}

/**
 * Delete data created by the public E2E forms. Community members first use the same backend deletion workflow as the
 * administration so their project-vote totals remain accurate; ordinary workshop activity continues to use cascades.
 */
async function deleteTestData(): Promise<DeletedTestDataCounts> {
    return runDatabaseTransaction('delete E2E test data', async (transaction) => {
        const deletedCommunityParticipantCount = await deleteTestCommunityParticipants(
            transaction,
            E2E_TEST_EMAIL_SQL_PATTERN,
        );
        const { rows } = await transaction.query<DeletedRemainingTestDataCounts>(DELETE_TEST_DATA_SQL, [
            E2E_TEST_EMAIL_SQL_PATTERN,
        ]);
        const deletedCounts = rows[0];

        if (deletedCounts === undefined) {
            throw new Error('The database did not return the E2E deletion counts.');
        }

        return {
            contacts: deletedCounts.contacts,
            workshopParticipants: addDeletedRowCount(
                deletedCounts.workshopParticipants,
                deletedCommunityParticipantCount,
            ),
        };
    });
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
