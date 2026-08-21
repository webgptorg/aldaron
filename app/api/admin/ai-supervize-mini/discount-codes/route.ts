import { aiSupervizeMiniDiscountCodeValuesSchema } from '@/businesses/ai-supervize-mini/discountCodeSchema';
import {
    AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME,
    createAiSupervizeMiniDiscountCodeMutationErrorResponse,
    createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse,
    createAiSupervizeMiniDiscountCodeDatabaseValues,
    getAiSupervizeMiniDiscountCodeDatabaseOrNull,
    loadAiSupervizeMiniDiscountCodes,
    mapAiSupervizeMiniDiscountCodeRow,
    type AiSupervizeMiniDiscountCodeRow,
} from '@/businesses/ai-supervize-mini/discountCodeDatabase';
import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Neplatný slevový kód.';

export async function GET(request: NextRequest) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse();
    }

    const { discountCodes, errorMessage } = await loadAiSupervizeMiniDiscountCodes(supabase);
    return discountCodes === null
        ? NextResponse.json({ error: errorMessage }, { status: 500 })
        : NextResponse.json({ discountCodes }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
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

    const supabase = getAiSupervizeMiniDiscountCodeDatabaseOrNull();
    if (supabase === null) {
        return createAiSupervizeMiniDiscountCodeDatabaseUnavailableResponse();
    }

    const { data, error } = await supabase
        .from(AI_SUPERVIZE_MINI_DISCOUNT_CODE_TABLE_NAME)
        .insert(createAiSupervizeMiniDiscountCodeDatabaseValues(parsedResult.data))
        .select('*')
        .single();
    if (error !== null) {
        return createAiSupervizeMiniDiscountCodeMutationErrorResponse(error);
    }

    return NextResponse.json(
        { discountCode: mapAiSupervizeMiniDiscountCodeRow(data as AiSupervizeMiniDiscountCodeRow) },
        { status: 201 },
    );
}
