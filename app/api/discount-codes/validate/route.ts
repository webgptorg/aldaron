import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscount } from '@/lib/discounts/discountCodeDatabase';
import { isKnownDiscountPlaceId } from '@/lib/discounts/discountPlaces';
import { NextRequest, NextResponse } from 'next/server';

const INVALID_DISCOUNT_CODE_ERROR_MESSAGE = 'Slevový kód není platný.';
const DISCOUNT_CODE_UNAVAILABLE_ERROR_MESSAGE = 'Slevový kód se nepodařilo ověřit. Zkuste to prosím znovu.';

function readDiscountCode(value: unknown): string | null {
    return typeof value === 'string' && value.length <= MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH ? value : null;
}

function readDiscountPlaceId(value: unknown): string | null {
    return typeof value === 'string' && isKnownDiscountPlaceId(value) ? value : null;
}

/**
 * Gives a registration form a price preview for exactly one code in exactly one place, without
 * taking a use of it. The registration endpoint resolves the very same code again, and only there
 * is a use of a limited code counted.
 */
export async function POST(request: NextRequest) {
    const body = await readJsonObjectOrNull(request);
    const discountCode = body === null ? null : readDiscountCode(body.discountCode);
    const discountPlaceId = body === null ? null : readDiscountPlaceId(body.discountPlaceId);
    if (discountCode === null || discountPlaceId === null) {
        return NextResponse.json({ error: INVALID_DISCOUNT_CODE_ERROR_MESSAGE }, { status: 400 });
    }

    const { activeDiscount, errorMessage } = await loadActiveDiscount(discountCode, discountPlaceId);
    if (errorMessage !== null) {
        console.error('Failed to validate the discount code:', errorMessage);
        return NextResponse.json({ error: DISCOUNT_CODE_UNAVAILABLE_ERROR_MESSAGE }, { status: 503 });
    }

    return NextResponse.json({ activeDiscount }, { headers: { 'Cache-Control': 'no-store' } });
}
