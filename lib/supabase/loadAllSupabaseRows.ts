import { reportSupabaseError, type SupabaseErrorLike } from '@/lib/supabase/reportSupabaseError';

/**
 * Largest stable page read from PostgREST before asking for the next page.
 *
 * Keeping the limit explicit prevents a private admin export from silently stopping at the database response cap.
 */
export const SUPABASE_ROW_PAGE_SIZE = 1_000;

/**
 * How a paged read is named in the server console when the caller did not name it itself.
 */
const DEFAULT_SUPABASE_PAGED_READ_NAME = 'a paged read';

export type SupabaseRowsPage<Row> = {
    readonly data: readonly Row[] | null;
    readonly error: SupabaseErrorLike | null;
};

/**
 * Read every page exposed by a Supabase query factory.
 *
 * Note: A refused page is reported to the server console with everything the database said about it, because the
 *       caller keeps only the message and an endpoint answers with only that.
 */
export async function loadAllSupabaseRows<Row>(
    loadPage: (fromIndex: number, toIndex: number) => PromiseLike<SupabaseRowsPage<Row>>,
    operationName: string = DEFAULT_SUPABASE_PAGED_READ_NAME,
): Promise<{ readonly rows: readonly Row[] | null; readonly errorMessage: string | null }> {
    const rows: Row[] = [];
    let fromIndex = 0;

    while (true) {
        const toIndex = fromIndex + SUPABASE_ROW_PAGE_SIZE - 1;
        const { data, error } = await loadPage(fromIndex, toIndex);
        if (error !== null) {
            return { rows: null, errorMessage: reportSupabaseError(operationName, error) };
        }

        const pageRows = data ?? [];
        rows.push(...pageRows);
        if (pageRows.length < SUPABASE_ROW_PAGE_SIZE) {
            return { rows, errorMessage: null };
        }

        fromIndex += SUPABASE_ROW_PAGE_SIZE;
    }
}
