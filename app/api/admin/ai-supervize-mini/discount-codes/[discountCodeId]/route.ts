import { aiSupervizeMiniDiscountCodeValuesSchema } from '@/businesses/ai-supervize-mini/discountCodeSchema';
import {
    AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME,
    createAiSupervizeMiniDiscountCodeMutationErrorResponse,
    createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse,
    createAiSupervizeMiniDiscountCodeDatabaseValues,
    getAiSupervizeMiniDiscountCodeDatabaseOrNull,
    mapAiSupervizeMiniDiscountCodeRow,
    type AiSupervizeMiniDiscountCodeRow,
} from '@/businesses/ai-supervize-mini/discountCodeDatabase';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE = 'Slevový kód nebyl nalezen.';
const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Neplatný slevový kód.';

type DiscountCodeRouteContext = {
    readonly params: Promise<{ readonly discountCodeId: string }>;
};

async function readDiscountCodeId(context: DiscountCodeRouteContext): Promise<string | null> {
    const { discountCodeId } = await context.params;

    return z.string().uuid().safeParse(discountCodeId).success ? discountCodeId : null;
}

export async function PATCH(request: NextRequest, context: DiscountCodeRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = aiSupervizeMiniDiscountCodeValuesSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json(
            { error: parsedResult.error.issues[0]?.message ?? INVALID_DISCOUNT_CODE_ERROR_MESSAGE },
            { status: 400 },
        );
    }

    const discountCodeId = await readDiscountCodeId(context);
    if (discountCodeId === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME)
        .update(createAiSupervizeMiniDiscountCodeDatabaseValues(parsedResult.data))
        .eq('id', discountCodeId)
        .select('*')
        .maybeSingle();
    if (error !== null) {
        return createAiSupervizeMiniDiscountCodeMutationErrorResponse(error);
    }
    if (data === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({ discountCode: mapAiSupervizeMiniDiscountCodeRow(data as AiSupervizeMiniDiscountCodeRow) });
}

export async function DELETE(request: NextRequest, context: DiscountCodeRouteContext) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const discountCodeId = await readDiscountCodeId(context);
    if (discountCodeId === null) {
        return NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 });
    }

    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME)
        .delete()
        .eq('id', discountCodeId)
        .select('id')
        .maybeSingle();
    if (error !== null) {
        return createAiSupervizeMiniDiscountCodeMutationErrorResponse(error);
    }

    return data === null
        ? NextResponse.json({ error: DISCOUNT_CODE_NOT_FOUND_ERROR_MESSAGE }, { status: 404 })
        : NextResponse.json({ success: true });
}
