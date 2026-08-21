/**
 * Largest stable page read from PostgREST before asking for the next page.
 *
 * Keeping the limit explicit prevents a private admin export from silently stopping at the database response cap.
 */
export const SUPABASE_ROW_PAGE_SIZE = 1_000;

export type SupabaseRowsPage<Row> = {
    readonly data: readonly Row[] | null;
    readonly error: { readonly message: string } | null;
};

/**
 * Read every page exposed by a Supabase query factory.
 */
export async function loadAllSupabaseRows<Row>(
    loadPage: (fromIndex: number, toIndex: number) => PromiseLike<SupabaseRowsPage<Row>>,
): Promise<{ readonly rows: readonly Row[] | null; readonly errorMessage: string | null }> {
    const rows: Row[] = [];
    let fromIndex = 0;

    while (true) {
        const toIndex = fromIndex + SUPABASE_ROW_PAGE_SIZE - 1;
        const { data, error } = await loadPage(fromIndex, toIndex);
        if (error !== null) {
            return { rows: null, errorMessage: error.message };
        }

        const pageRows = data ?? [];
        rows.push(...pageRows);
        if (pageRows.length < SUPABASE_ROW_PAGE_SIZE) {
            return { rows, errorMessage: null };
        }

        fromIndex += SUPABASE_ROW_PAGE_SIZE;
    }
}
