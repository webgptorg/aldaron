import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    CUSTOM_SHORTCODE_LINK_TYPE,
    SHORTCODE_LINK_TABLE_NAME,
} from '@/lib/shortener/shortcodeLinkConstants';
import { SHORTCODE_LINK_CREATION_SCHEMA } from '@/lib/shortener/shortcodeLinkSchema';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const SHORTCODE_LINK_DATABASE_UNAVAILABLE_ERROR_MESSAGE = 'Database not configured';
const SHORTCODE_LINK_CONFLICT_ERROR_MESSAGE = 'This shortcode is already in use';

/**
 * Creates a public short link after the shared admin token and the supplied values have both been verified.
 */
export async function POST(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const creationResult = SHORTCODE_LINK_CREATION_SCHEMA.safeParse(body);
    if (!creationResult.success) {
        return NextResponse.json(
            { error: creationResult.error.issues[0]?.message ?? 'Invalid short link' },
            { status: 400 },
        );
    }

    const supabase = createSupabaseServiceRoleClient();
    if (supabase === null) {
        return NextResponse.json({ error: SHORTCODE_LINK_DATABASE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
    }

    const { error } = await supabase.from(SHORTCODE_LINK_TABLE_NAME).insert({
        type: CUSTOM_SHORTCODE_LINK_TYPE,
        shortcode: creationResult.data.shortcode,
        url: creationResult.data.urls,
        ownerEmail: null,
    });
    if (error) {
        const status = error.code === POSTGRES_UNIQUE_VIOLATION_CODE ? 409 : 500;
        const errorMessage =
            error.code === POSTGRES_UNIQUE_VIOLATION_CODE ? SHORTCODE_LINK_CONFLICT_ERROR_MESSAGE : error.message;

        return NextResponse.json({ error: errorMessage }, { status });
    }

    return NextResponse.json({ shortcode: creationResult.data.shortcode }, { status: 201 });
}
