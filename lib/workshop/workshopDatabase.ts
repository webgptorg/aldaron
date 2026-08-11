import { createSupabaseClient } from '@/lib/supabase';
import { createWorkshopApiError } from '@/lib/workshop/workshopApiError';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

/**
 * Postgres code of a query which asks for a table that was never created
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const UNDEFINED_TABLE_POSTGRES_CODE = '42P01';

/**
 * Database the workshop lives in
 *
 * @throws When the site runs without a configured database, which the api answers as "temporarily unavailable"
 */
export function getWorkshopDatabase(): SupabaseClient {
    const database = createSupabaseClient();

    if (database === null) {
        throw createWorkshopApiError('The database is not configured', 503);
    }

    return database;
}

/**
 * Let a failed query through as an error which the api can answer
 *
 * Note: A missing table is the one failure which is expected on a fresh installation, so it is reported with the
 *       cure instead of a bare postgres message.
 */
export function assertQuerySucceeded(error: PostgrestError | null): void {
    if (error === null) {
        return;
    }

    if (error.code === UNDEFINED_TABLE_POSTGRES_CODE) {
        throw createWorkshopApiError(
            'The workshop tables are missing in the database, run the statements from `lib/workshop/workshop-tables.sql`',
            503,
        );
    }

    throw createWorkshopApiError(error.message, 500);
}
