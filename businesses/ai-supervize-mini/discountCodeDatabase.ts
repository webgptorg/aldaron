import {
    isAiSupervizeMiniDiscountCodeNormalized,
    normalizeAiSupervizeMiniDiscountCode,
    type AiSupervizeMiniActiveDiscount,
    type AiSupervizeMiniDiscountCode,
    type AiSupervizeMiniDiscountCodeValues,
} from '@/businesses/ai-supervize-mini/discountCode';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME = 'ai_supervize_mini_discount_codes';
const AI_SUPERVIZE_MINI_DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE = 'Database not configured';
const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE = 'Slevový kód již existuje.';

export type AiSupervizeMiniDiscountCodeRow = {
    readonly id: string;
    readonly code: string;
    readonly percent: number;
    readonly starts_at: string;
    readonly ends_at: string;
    readonly is_enabled: boolean;
    readonly is_online_workshop_follow_up: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};

type AiSupervizeMiniActiveDiscountRow = Pick<AiSupervizeMiniDiscountCodeRow, 'code' | 'percent'>;

export type AiSupervizeMiniActiveDiscountLoadResult = {
    readonly activeDiscount: AiSupervizeMiniActiveDiscount | null;
    readonly errorMessage: string | null;
};

export type AiSupervizeMiniDiscountCodeLoadResult = {
    readonly discountCodes: readonly AiSupervizeMiniDiscountCode[] | null;
    readonly errorMessage: string | null;
};

/**
 * Reaches discount codes only through the server service role. Public browsers
 * ask narrowly scoped API endpoints instead of receiving the private code list.
 */
export function getAiSupervizeMiniDiscountCodeDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse(): NextResponse {
    console.error(
        `⚠️ The AI Supervize Mini discount codes cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "${AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME}" table is closed by row level security`,
    );

    return NextResponse.json({ error: AI_SUPERVIZE_MINI_DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
}

/**
 * Converts a database write failure into the stable response the admin UI can
 * present. Both create and update use the same code constraint.
 */
export function createAiSupervizeMiniDiscountCodeMutationErrorResponse(error: {
    readonly code?: string;
    readonly message: string;
}): NextResponse {
    const isDuplicateDiscountCode = error.code === POSTGRES_UNIQUE_VIOLATION_CODE;

    return NextResponse.json(
        { error: isDuplicateDiscountCode ? DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE : error.message },
        { status: isDuplicateDiscountCode ? 409 : 500 },
    );
}

export function mapAiSupervizeMiniDiscountCodeRow(
    discountCodeRow: AiSupervizeMiniDiscountCodeRow,
): AiSupervizeMiniDiscountCode {
    return {
        id: discountCodeRow.id,
        code: discountCodeRow.code,
        percent: discountCodeRow.percent,
        startsAt: discountCodeRow.starts_at,
        endsAt: discountCodeRow.ends_at,
        isEnabled: discountCodeRow.is_enabled,
        isOnlineWorkshopFollowUp: discountCodeRow.is_online_workshop_follow_up,
        createdAt: discountCodeRow.created_at,
        updatedAt: discountCodeRow.updated_at,
    };
}

export function createAiSupervizeMiniDiscountCodeDatabaseValues(
    discountCode: AiSupervizeMiniDiscountCodeValues,
): Readonly<Record<string, string | number | boolean>> {
    return {
        code: discountCode.code,
        percent: discountCode.percent,
        starts_at: discountCode.startsAt,
        ends_at: discountCode.endsAt,
        is_enabled: discountCode.isEnabled,
        is_online_workshop_follow_up: discountCode.isOnlineWorkshopFollowUp,
    };
}

function createActiveAiSupervizeMiniDiscountCodeQuery(supabase: SupabaseClient, currentDate: Date) {
    const currentDateIso = currentDate.toISOString();

    return supabase
        .from(AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME)
        .select('code, percent')
        .eq('is_enabled', true)
        .lte('starts_at', currentDateIso)
        .gte('ends_at', currentDateIso);
}

function mapAiSupervizeMiniActiveDiscount(
    activeDiscountRow: AiSupervizeMiniActiveDiscountRow,
): AiSupervizeMiniActiveDiscount {
    return { code: activeDiscountRow.code, percent: activeDiscountRow.percent };
}

export async function loadAiSupervizeMiniDiscountCodes(
    supabase: SupabaseClient,
): Promise<AiSupervizeMiniDiscountCodeLoadResult> {
    const { data, error } = await supabase
        .from(AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME)
        .select('*')
        .order('starts_at', { ascending: false })
        .order('created_at', { ascending: false });

    if (error !== null) {
        return { discountCodes: null, errorMessage: error.message };
    }

    return {
        discountCodes: ((data ?? []) as AiSupervizeMiniDiscountCodeRow[]).map(mapAiSupervizeMiniDiscountCodeRow),
        errorMessage: null,
    };
}

/**
 * Resolves a manually entered discount code at the same instant the server
 * needs to decide its price. Empty values skip the database altogether.
 */
export async function loadAiSupervizeMiniActiveDiscount(
    discountCodeValue: string,
    currentDate: Date = new Date(),
): Promise<AiSupervizeMiniActiveDiscountLoadResult> {
    const normalizedDiscountCode = normalizeAiSupervizeMiniDiscountCode(discountCodeValue);
    if (!isAiSupervizeMiniDiscountCodeNormalized(normalizedDiscountCode)) {
        return { activeDiscount: null, errorMessage: null };
    }

    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { activeDiscount: null, errorMessage: AI_SUPERVIZE_MINI_DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { data, error } = await createActiveAiSupervizeMiniDiscountCodeQuery(supabase, currentDate)
        .eq('code', normalizedDiscountCode)
        .maybeSingle();
    if (error !== null) {
        return { activeDiscount: null, errorMessage: error.message };
    }

    return {
        activeDiscount: data === null ? null : mapAiSupervizeMiniActiveDiscount(data as AiSupervizeMiniActiveDiscountRow),
        errorMessage: null,
    };
}

/**
 * Resolves the one promotion selected by an administrator for visitors coming
 * from the online workshop. A source link therefore never embeds a code.
 */
export async function loadAiSupervizeMiniOnlineWorkshopFollowUpDiscount(
    currentDate: Date = new Date(),
): Promise<AiSupervizeMiniActiveDiscountLoadResult> {
    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { activeDiscount: null, errorMessage: AI_SUPERVIZE_MINI_DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { data, error } = await createActiveAiSupervizeMiniDiscountCodeQuery(supabase, currentDate)
        .eq('is_online_workshop_follow_up', true)
        .maybeSingle();
    if (error !== null) {
        return { activeDiscount: null, errorMessage: error.message };
    }

    return {
        activeDiscount: data === null ? null : mapAiSupervizeMiniActiveDiscount(data as AiSupervizeMiniActiveDiscountRow),
        errorMessage: null,
    };
}
