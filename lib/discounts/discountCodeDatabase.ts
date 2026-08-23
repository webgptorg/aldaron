import {
    createActiveDiscount,
    isDiscountCodeNormalized,
    isDiscountCodeUsableInPlace,
    normalizeDiscountCode,
    type ActiveDiscount,
    type ActiveDiscountByPlaceId,
    type DiscountCode,
    type DiscountCodeValues,
} from '@/lib/discounts/discountCode';
import {
    CONSUME_DISCOUNT_CODE_FUNCTION_NAME,
    DISCOUNT_CODE_TABLE_NAME,
} from '@/lib/discounts/discountCodeConstants';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE = 'Database not configured';
const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';
const DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE = 'Slevový kód již existuje.';

export type DiscountCodeRow = {
    readonly id: string;
    readonly code: string;
    readonly percent: number;
    readonly starts_at: string;
    readonly ends_at: string;
    readonly is_enabled: boolean;
    readonly place_ids: readonly string[] | null;
    readonly maximum_use_count: number | null;
    readonly use_count: number;
    readonly created_at: string;
    readonly updated_at: string;
};

/**
 * Whether one registration really took a use of the submitted code. A code which has just run out
 * is told apart from an unknown one, because a visitor who was shown a discounted price must never
 * be charged the full one without being told about it.
 */
export type DiscountCodeConsumptionStatus = 'applied' | 'exhausted' | 'unusable';

type DiscountCodeConsumptionRow = {
    readonly status: string;
    readonly code: string;
    readonly percent: number | null;
    readonly remaining_use_count: number | null;
};

export type ActiveDiscountLoadResult = {
    readonly activeDiscount: ActiveDiscount | null;
    readonly errorMessage: string | null;
};

export type ActiveDiscountsByPlaceLoadResult = {
    readonly activeDiscountByPlaceId: ActiveDiscountByPlaceId;
    readonly errorMessage: string | null;
};

export type DiscountCodeConsumptionResult = {
    readonly status: DiscountCodeConsumptionStatus;
    readonly activeDiscount: ActiveDiscount | null;
    readonly errorMessage: string | null;
};

export type DiscountCodeLoadResult = {
    readonly discountCodes: readonly DiscountCode[] | null;
    readonly errorMessage: string | null;
};

/**
 * Reaches discount codes only through the server service role. Public browsers ask narrowly scoped
 * API endpoints instead of ever receiving the private list of codes.
 */
export function getDiscountCodeDatabaseOrNull(): SupabaseClient | null {
    return createSupabaseServiceRoleClient();
}

export function createDiscountCodeDatabaseUnavailableResponse(): NextResponse {
    console.error(
        `⚠️ The discount codes cannot be reached, set SUPABASE_SERVICE_ROLE_KEY - the "${DISCOUNT_CODE_TABLE_NAME}" table is closed by row level security`,
    );

    return NextResponse.json({ error: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
}

/**
 * Converts a database write failure into the stable response the admin UI can present. Both create
 * and update use the same code constraint.
 */
export function createDiscountCodeMutationErrorResponse(error: {
    readonly code?: string;
    readonly message: string;
}): NextResponse {
    const isDuplicateDiscountCode = error.code === POSTGRES_UNIQUE_VIOLATION_CODE;

    return NextResponse.json(
        { error: isDuplicateDiscountCode ? DISCOUNT_CODE_CONFLICT_ERROR_MESSAGE : error.message },
        { status: isDuplicateDiscountCode ? 409 : 500 },
    );
}

export function mapDiscountCodeRow(discountCodeRow: DiscountCodeRow): DiscountCode {
    return {
        id: discountCodeRow.id,
        code: discountCodeRow.code,
        percent: discountCodeRow.percent,
        startsAt: discountCodeRow.starts_at,
        endsAt: discountCodeRow.ends_at,
        isEnabled: discountCodeRow.is_enabled,
        placeIds: discountCodeRow.place_ids ?? [],
        maximumUseCount: discountCodeRow.maximum_use_count,
        useCount: discountCodeRow.use_count,
        createdAt: discountCodeRow.created_at,
        updatedAt: discountCodeRow.updated_at,
    };
}

export function createDiscountCodeDatabaseValues(
    discountCode: DiscountCodeValues,
): Readonly<Record<string, string | number | boolean | readonly string[] | null>> {
    return {
        code: discountCode.code,
        percent: discountCode.percent,
        starts_at: discountCode.startsAt,
        ends_at: discountCode.endsAt,
        is_enabled: discountCode.isEnabled,
        place_ids: discountCode.placeIds,
        maximum_use_count: discountCode.maximumUseCount,
    };
}

export async function loadDiscountCodes(supabase: SupabaseClient): Promise<DiscountCodeLoadResult> {
    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .select('*')
        .order('starts_at', { ascending: false })
        .order('created_at', { ascending: false });

    if (error !== null) {
        return { discountCodes: null, errorMessage: error.message };
    }

    return {
        discountCodes: ((data ?? []) as DiscountCodeRow[]).map(mapDiscountCodeRow),
        errorMessage: null,
    };
}

type SubmittedDiscountCodeLoadResult = {
    readonly discountCode: DiscountCode | null;
    readonly errorMessage: string | null;
};

/**
 * Reads the one stored code a visitor submitted, without taking a use of it and without saying
 * anything about any other code.
 */
async function loadSubmittedDiscountCode(discountCodeValue: string): Promise<SubmittedDiscountCodeLoadResult> {
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValue);
    if (!isDiscountCodeNormalized(normalizedDiscountCode)) {
        return { discountCode: null, errorMessage: null };
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return { discountCode: null, errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE };
    }

    const { data, error } = await supabase
        .from(DISCOUNT_CODE_TABLE_NAME)
        .select('*')
        .eq('code', normalizedDiscountCode)
        .maybeSingle();
    if (error !== null) {
        return { discountCode: null, errorMessage: error.message };
    }

    return {
        discountCode: data === null ? null : mapDiscountCodeRow(data as DiscountCodeRow),
        errorMessage: null,
    };
}

/**
 * Answers a price preview about one code in one place. The decision itself is the shared
 * `isDiscountCodeUsableInPlace`, so a preview, the administration and a registration all call one
 * code valid or invalid for the very same reasons.
 */
export async function loadActiveDiscount(
    discountCodeValue: string,
    discountPlaceId: string,
    currentDate: Date = new Date(),
): Promise<ActiveDiscountLoadResult> {
    const { discountCode, errorMessage } = await loadSubmittedDiscountCode(discountCodeValue);
    if (discountCode === null) {
        return { activeDiscount: null, errorMessage };
    }

    return {
        activeDiscount: isDiscountCodeUsableInPlace(discountCode, discountPlaceId, currentDate)
            ? createActiveDiscount(discountCode)
            : null,
        errorMessage: null,
    };
}

/**
 * Answers about one code in every place a single page offers, which a page opened by a `?code=`
 * link needs in order to lead the visitor to the offer the code is actually valid in. One read of
 * the code answers all of them.
 */
export async function loadActiveDiscountsByPlace(
    discountCodeValue: string,
    discountPlaceIds: readonly string[],
    currentDate: Date = new Date(),
): Promise<ActiveDiscountsByPlaceLoadResult> {
    const { discountCode, errorMessage } = await loadSubmittedDiscountCode(discountCodeValue);
    const activeDiscount = discountCode === null ? null : createActiveDiscount(discountCode);

    return {
        activeDiscountByPlaceId: Object.fromEntries(
            discountPlaceIds.map((discountPlaceId) => [
                discountPlaceId,
                discountCode !== null && isDiscountCodeUsableInPlace(discountCode, discountPlaceId, currentDate)
                    ? activeDiscount
                    : null,
            ]),
        ),
        errorMessage,
    };
}

function readDiscountCodeConsumptionStatus(status: string): DiscountCodeConsumptionStatus {
    return status === 'applied' || status === 'exhausted' ? status : 'unusable';
}

function createDiscountCodeConsumptionResult(
    consumptionRow: DiscountCodeConsumptionRow,
): DiscountCodeConsumptionResult {
    const status = readDiscountCodeConsumptionStatus(consumptionRow.status);

    return {
        status,
        activeDiscount:
            status === 'applied' && consumptionRow.percent !== null
                ? {
                      code: consumptionRow.code,
                      percent: consumptionRow.percent,
                      remainingUseCount: consumptionRow.remaining_use_count,
                  }
                : null,
        errorMessage: null,
    };
}

/**
 * Takes exactly one use of the submitted code for the given place. Counting the use inside the
 * very statement which reads the limit is what keeps two registrations sent at the same moment
 * from sharing the last use of a limited code.
 */
export async function consumeDiscountCode(
    discountCodeValue: string,
    discountPlaceId: string,
): Promise<DiscountCodeConsumptionResult> {
    const normalizedDiscountCode = normalizeDiscountCode(discountCodeValue);
    if (!isDiscountCodeNormalized(normalizedDiscountCode)) {
        return { status: 'unusable', activeDiscount: null, errorMessage: null };
    }

    const supabase = getDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return {
            status: 'unusable',
            activeDiscount: null,
            errorMessage: DISCOUNT_CODE_DATABASE_UNAVAILABLE_ERROR_MESSAGE,
        };
    }

    const { data, error } = await supabase.rpc(CONSUME_DISCOUNT_CODE_FUNCTION_NAME, {
        discount_code: normalizedDiscountCode,
        discount_place_id: discountPlaceId,
    });
    if (error !== null) {
        return { status: 'unusable', activeDiscount: null, errorMessage: error.message };
    }

    const consumptionRow = ((data ?? []) as DiscountCodeConsumptionRow[])[0];

    return consumptionRow === undefined
        ? { status: 'unusable', activeDiscount: null, errorMessage: null }
        : createDiscountCodeConsumptionResult(consumptionRow);
}
