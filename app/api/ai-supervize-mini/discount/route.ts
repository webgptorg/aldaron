import { MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_INPUT_LENGTH } from '@/businesses/ai-supervize-mini/discountCode';
import { loadAiSupervizeMiniActiveDiscount } from '@/businesses/ai-supervize-mini/discountCodeDatabase';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Slevový kód není platný.';
const DISCOUNT_CODE_UNAVAILABLE_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';

function readDiscountCode(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_AI_SUPERVIZE_MINI_DISCOUNT_CODE_INPUT_LENGTH
        ? value
        : null;
}

/**
 * Gives the registration form a price-preview result for exactly one code.
 * The registration endpoint resolves the code again before it persists a price.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);
    const discountCode = body === null ? null : readDiscountCode(body.discountCode);
    if (discountCode === null) {
        return NextResponse.json({ error: INVALID_DISCOUNT_CODE_ERROR_MESSAGE }, { status: 400 });
    }

    const { activeDiscount, errorMessage } = await loadAiSupervizeMiniActiveDiscount(discountCode);
    if (errorMessage !== null) {
        console.error('Failed to validate AI Supervize Mini discount code:', errorMessage);
        return NextResponse.json({ error: DISCOUNT_CODE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
    }

    return NextResponse.json(
        { activeDiscount },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
