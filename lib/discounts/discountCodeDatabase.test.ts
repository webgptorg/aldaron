import { RESOLVE_DISCOUNT_CODE_FUNCTION_NAME } from '@/lib/discounts/discountCodeConstants';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
    createSupabaseServiceRoleClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}));

import { loadActiveDiscount } from './discountCodeDatabase';

const WILDCARD_DISCOUNT_CODE_ROW = {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'SUMMER*',
    percent: 20,
    starts_at: '2026-08-20T00:00:00.000Z',
    ends_at: '2026-08-21T00:00:00.000Z',
    is_enabled: true,
    place_ids: [],
    maximum_use_count: null,
    subscription_discount_duration_months: null,
    use_count: 0,
    created_at: '2026-08-19T00:00:00.000Z',
    updated_at: '2026-08-19T00:00:00.000Z',
};

describe('submitted discount-code loading', () => {
    beforeEach(() => {
        createSupabaseServiceRoleClientMock.mockReset();
    });

    it('uses the shared database resolver for a wildcard preview', async () => {
        const resolveDiscountCode = vi.fn().mockResolvedValue({
            data: [WILDCARD_DISCOUNT_CODE_ROW],
            error: null,
        });
        createSupabaseServiceRoleClientMock.mockReturnValue({ rpc: resolveDiscountCode });

        const result = await loadActiveDiscount(
            'summer-vip',
            'ai-supervize-mini-onsite',
            new Date('2026-08-20T12:00:00.000Z'),
        );

        expect(resolveDiscountCode).toHaveBeenCalledWith(RESOLVE_DISCOUNT_CODE_FUNCTION_NAME, {
            submitted_discount_code: 'SUMMER_VIP',
        });
        expect(result).toEqual({
            activeDiscount: {
                code: 'SUMMER*',
                percent: 20,
                remainingUseCount: null,
                subscriptionDiscountDurationMonths: null,
            },
            errorMessage: null,
        });
    });
});
