import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import type { StripeGateway } from '@/lib/payments/stripeGateway';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommunityMembershipCheckoutSession } from './communityMembershipCheckout';

const createCoupon = vi.fn();
const createCheckoutSession = vi.fn();

const MEMBER = {
    participantId: '00000000-0000-0000-0000-000000000001',
    fullname: 'Jana Nováková',
    email: 'jana@example.com',
};

const CHECKOUT_URLS = {
    successUrl: 'https://ptbk.io/cs/komunita?membership=paid&checkoutSession={CHECKOUT_SESSION_ID}',
    cancelUrl: 'https://ptbk.io/cs/komunita?membership=cancelled',
};

const DISCOUNTED_PRICE: CommunityMembershipPrice = {
    baseBillingPriceCzk: 199,
    discountAmountCzk: 50,
    finalBillingPriceCzk: 149,
    baseMonthlyEquivalentCzk: 199,
    finalMonthlyEquivalentCzk: 149,
};

function createGateway(): StripeGateway {
    return {
        stripe: {
            coupons: { create: createCoupon },
            checkout: { sessions: { create: createCheckoutSession } },
        },
        configuration: {
            secretKey: 'sk_test_example',
            webhookSigningSecret: null,
            isTestMode: true,
        },
    } as unknown as StripeGateway;
}

function createActiveDiscount(overrides: Partial<ActiveDiscount> = {}): ActiveDiscount {
    return {
        code: 'MEMBERSHIP_25',
        percent: 25,
        remainingUseCount: null,
        subscriptionDiscountDurationMonths: null,
        ...overrides,
    };
}

describe('community membership checkout', () => {
    beforeEach(() => {
        createCoupon.mockReset();
        createCheckoutSession.mockReset();
        createCoupon.mockResolvedValue({ id: 'coupon_membership_discount' });
        createCheckoutSession.mockResolvedValue({ id: 'cs_membership', url: 'https://checkout.stripe.com/example' });
    });

    it('uses a permanent Stripe coupon while keeping the subscription line item at its normal price', async () => {
        await createCommunityMembershipCheckoutSession(
            createGateway(),
            MEMBER,
            DISCOUNTED_PRICE,
            createActiveDiscount(),
            CHECKOUT_URLS,
        );

        expect(createCoupon).toHaveBeenCalledWith({
            percent_off: 25,
            duration: 'forever',
            name: 'Sleva 25 %',
            metadata: { discountCode: 'MEMBERSHIP_25' },
        });
        expect(createCheckoutSession).toHaveBeenCalledWith(
            expect.objectContaining({
                discounts: [{ coupon: 'coupon_membership_discount' }],
                line_items: [
                    expect.objectContaining({
                        price_data: expect.objectContaining({ unit_amount: 19_900 }),
                    }),
                ],
            }),
        );
    });

    it('creates a repeating coupon for precisely the selected discounted months', async () => {
        await createCommunityMembershipCheckoutSession(
            createGateway(),
            MEMBER,
            DISCOUNTED_PRICE,
            createActiveDiscount({ subscriptionDiscountDurationMonths: 3 }),
            CHECKOUT_URLS,
        );

        expect(createCoupon).toHaveBeenCalledWith({
            percent_off: 25,
            duration: 'repeating',
            duration_in_months: 3,
            name: 'Sleva 25 %',
            metadata: { discountCode: 'MEMBERSHIP_25' },
        });
    });

    it('opens the normal recurring price without creating a coupon when no code was applied', async () => {
        await createCommunityMembershipCheckoutSession(createGateway(), MEMBER, DISCOUNTED_PRICE, null, CHECKOUT_URLS);

        expect(createCoupon).not.toHaveBeenCalled();
        expect(createCheckoutSession).toHaveBeenCalledWith(
            expect.objectContaining({
                line_items: [
                    expect.objectContaining({
                        price_data: expect.objectContaining({ unit_amount: 19_900 }),
                    }),
                ],
            }),
        );
        expect(createCheckoutSession.mock.calls[0]?.[0]).not.toHaveProperty('discounts');
    });
});
