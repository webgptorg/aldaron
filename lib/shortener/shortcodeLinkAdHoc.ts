import { generateShortcode } from '@/lib/shortener/generateShortcode';
import type { ShortcodeLink, ShortcodeLinkSourceApp } from '@/lib/shortener/shortcodeLink';
import { SHORTCODE_LINK_TABLE_NAME } from '@/lib/shortener/shortcodeLinkConstants';
import {
    createAdHocShortcodeLinkInsertValues,
    mapShortcodeLinkRow,
    SHORTCODE_LINK_SELECTED_COLUMNS,
    type ShortcodeLinkRow,
} from '@/lib/shortener/shortcodeLinkDatabase';
import type { SupabaseErrorLike } from '@/lib/supabase/reportSupabaseError';
import type { SupabaseClient } from '@supabase/supabase-js';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const MAXIMAL_SHORTCODE_GENERATION_ATTEMPT_COUNT = 5;

type CreatedAdHocShortcodeLink =
    | { readonly shortcodeLink: ShortcodeLink; readonly errorMessage: null }
    | { readonly shortcodeLink: null; readonly errorMessage: string };

/**
 * Makes a private, collision-safe candidate into a public short link. This is
 * deliberately server-only: public material rendering may request a link, but
 * a browser never receives authority to write the shortener itself.
 */
export async function createAdHocShortcodeLink(
    supabase: SupabaseClient,
    values: {
        readonly urls: readonly string[];
        readonly note: string | null;
        readonly sourceApp: ShortcodeLinkSourceApp;
    },
): Promise<CreatedAdHocShortcodeLink> {
    for (let attempt = 0; attempt < MAXIMAL_SHORTCODE_GENERATION_ATTEMPT_COUNT; attempt++) {
        const { data, error } = await supabase
            .from(SHORTCODE_LINK_TABLE_NAME)
            .insert(
                createAdHocShortcodeLinkInsertValues({
                    shortcode: generateShortcode(),
                    ...values,
                }),
            )
            .select(SHORTCODE_LINK_SELECTED_COLUMNS)
            .single();

        if (error === null && data !== null) {
            return {
                shortcodeLink: mapShortcodeLinkRow(data as unknown as ShortcodeLinkRow),
                errorMessage: null,
            };
        }

        if ((error as SupabaseErrorLike | null)?.code !== POSTGRES_UNIQUE_VIOLATION_CODE) {
            return {
                shortcodeLink: null,
                errorMessage: error?.message ?? 'The ad hoc short link was not returned',
            };
        }
    }

    return {
        shortcodeLink: null,
        errorMessage: 'A unique short link could not be generated',
    };
}
