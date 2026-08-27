import type { ShortcodeLinkClick } from '@/lib/shortener/shortcodeLink';
import { SHORTCODE_LINK_CLICK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import type { SupabaseErrorLike } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';

const SHORTCODE_LINK_CLICK_COUNT_SELECTED_COLUMNS = 'shortcodeLinkId';
export const SHORTCODE_LINK_CLICK_SELECTED_COLUMNS =
    'id, shortcodeLinkId, navigatedAt, clickedAt, ip, userAgent, referer, language, platform';

type ShortcodeLinkClickCountRow = {
    readonly shortcodeLinkId: number | null;
};

export type ShortcodeLinkClickRow = {
    readonly id: number;
    readonly shortcodeLinkId: number;
    readonly navigatedAt: string | null;
    readonly clickedAt: string | null;
    readonly ip: string | null;
    readonly userAgent: string | null;
    readonly referer: string | null;
    readonly language: string | null;
    readonly platform: string | null;
};

type ShortcodeLinkClickLoadResult = {
    readonly shortcodeLinkClicks: readonly ShortcodeLinkClick[] | null;
    readonly errorMessage: string | null;
};

type ShortcodeLinkClickCountLoadResult = {
    readonly clickCountByShortcodeLinkId: ReadonlyMap<number, number> | null;
    readonly errorMessage: string | null;
};

function isShortcodeLinkId(value: number | null): value is number {
    return value !== null && Number.isSafeInteger(value) && value > 0;
}

/**
 * Turns the database's nullable representation into the click which the administration can show. A row without a
 * navigation timestamp is not a completed short-link visit and therefore stays out of every click count and detail.
 */
export function mapShortcodeLinkClickRow(shortcodeLinkClickRow: ShortcodeLinkClickRow): ShortcodeLinkClick | null {
    if (!isShortcodeLinkId(shortcodeLinkClickRow.shortcodeLinkId) || shortcodeLinkClickRow.navigatedAt === null) {
        return null;
    }

    return {
        id: shortcodeLinkClickRow.id,
        shortcodeLinkId: shortcodeLinkClickRow.shortcodeLinkId,
        navigatedAt: shortcodeLinkClickRow.navigatedAt,
        clickedAt: shortcodeLinkClickRow.clickedAt,
        ip: shortcodeLinkClickRow.ip,
        userAgent: shortcodeLinkClickRow.userAgent,
        referer: shortcodeLinkClickRow.referer,
        language: shortcodeLinkClickRow.language,
        platform: shortcodeLinkClickRow.platform,
    };
}

/**
 * Counts navigations by their short link without sending click metadata to the browser. The existing partial index on
 * `(shortcodeLinkId, navigatedAt)` answers exactly this set of rows.
 */
export async function loadShortcodeLinkClickCounts(
    supabase: SupabaseClient,
): Promise<ShortcodeLinkClickCountLoadResult> {
    const { rows, errorMessage } = await loadAllSupabaseRows<ShortcodeLinkClickCountRow>(
        (fromIndex, toIndex) =>
            supabase
                .from(SHORTCODE_LINK_CLICK_TABLE_NAME)
                .select(SHORTCODE_LINK_CLICK_COUNT_SELECTED_COLUMNS)
                .not('navigatedAt', 'is', null)
                .order('shortcodeLinkId', { ascending: true })
                .order('id', { ascending: true })
                .range(fromIndex, toIndex) as PromiseLike<{
                readonly data: readonly ShortcodeLinkClickCountRow[] | null;
                readonly error: SupabaseErrorLike | null;
            }>,
        'the counting of short-link clicks',
    );

    if (rows === null) {
        return { clickCountByShortcodeLinkId: null, errorMessage };
    }

    const clickCountByShortcodeLinkId = new Map<number, number>();
    for (const shortcodeLinkClickRow of rows) {
        if (!isShortcodeLinkId(shortcodeLinkClickRow.shortcodeLinkId)) {
            continue;
        }

        const clickCount = clickCountByShortcodeLinkId.get(shortcodeLinkClickRow.shortcodeLinkId) ?? 0;
        clickCountByShortcodeLinkId.set(shortcodeLinkClickRow.shortcodeLinkId, clickCount + 1);
    }

    return { clickCountByShortcodeLinkId, errorMessage: null };
}

/**
 * Reads the complete navigation history of one short link, newest first. It deliberately uses the same completed
 * navigation definition as the aggregate above, so the number in the list and the rows in this view never disagree.
 */
export async function loadShortcodeLinkClicks(
    supabase: SupabaseClient,
    shortcodeLinkId: number,
): Promise<ShortcodeLinkClickLoadResult> {
    const { rows, errorMessage } = await loadAllSupabaseRows<ShortcodeLinkClickRow>(
        (fromIndex, toIndex) =>
            supabase
                .from(SHORTCODE_LINK_CLICK_TABLE_NAME)
                .select(SHORTCODE_LINK_CLICK_SELECTED_COLUMNS)
                .eq('shortcodeLinkId', shortcodeLinkId)
                .not('navigatedAt', 'is', null)
                .order('navigatedAt', { ascending: false })
                .order('id', { ascending: false })
                .range(fromIndex, toIndex) as PromiseLike<{
                readonly data: readonly ShortcodeLinkClickRow[] | null;
                readonly error: SupabaseErrorLike | null;
            }>,
        'the listing of short-link clicks',
    );

    return rows === null
        ? { shortcodeLinkClicks: null, errorMessage }
        : {
              shortcodeLinkClicks: rows
                  .map(mapShortcodeLinkClickRow)
                  .filter((shortcodeLinkClick): shortcodeLinkClick is ShortcodeLinkClick => shortcodeLinkClick !== null),
              errorMessage: null,
          };
}
