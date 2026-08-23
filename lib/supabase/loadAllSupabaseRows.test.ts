import { loadAllSupabaseRows, SUPABASE_ROW_PAGE_SIZE } from '@/lib/supabase/loadAllSupabaseRows';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('loadAllSupabaseRows', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reads every full page before returning the final partial page', async () => {
        const firstPageRows = Array.from({ length: SUPABASE_ROW_PAGE_SIZE }, (_, index) => index);
        const loadPage = vi
            .fn()
            .mockResolvedValueOnce({ data: firstPageRows, error: null })
            .mockResolvedValueOnce({ data: [SUPABASE_ROW_PAGE_SIZE], error: null });

        const result = await loadAllSupabaseRows(loadPage);

        expect(result).toEqual({ rows: [...firstPageRows, SUPABASE_ROW_PAGE_SIZE], errorMessage: null });
        expect(loadPage).toHaveBeenNthCalledWith(1, 0, SUPABASE_ROW_PAGE_SIZE - 1);
        expect(loadPage).toHaveBeenNthCalledWith(2, SUPABASE_ROW_PAGE_SIZE, SUPABASE_ROW_PAGE_SIZE * 2 - 1);
    });

    it('returns the database error without continuing to another page', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const loadPage = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database unavailable' } });

        const result = await loadAllSupabaseRows(loadPage);

        expect(result).toEqual({ rows: null, errorMessage: 'Database unavailable' });
        expect(loadPage).toHaveBeenCalledTimes(1);
    });

    it('names the refused read in the server console', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const loadPage = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database unavailable' } });

        await loadAllSupabaseRows(loadPage, 'the gathered contacts');

        expect(String(consoleErrorSpy.mock.calls[0]?.[0])).toContain('the gathered contacts');
    });
});
