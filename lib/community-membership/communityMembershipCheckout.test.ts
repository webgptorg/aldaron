import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import type { ActiveDiscount } from '@/lib/discounts/discountCode';
import type { StripeGateway } from '@/lib/payments/stripeGateway';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createCommunityMembershipCheckoutSession,
    createCommunityMembershipCheckoutUrls,
    STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER,
} from './communityMembershipCheckout';

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

const COMMUNITY_ROOM_URL = 'https://ptbk.io/cs/komunita';
const WORKSHOP_ROOM_URL = 'https://ptbk.io/cs/online-workshop/participant?workshop=produkcni-kod-s-ai-agenty';

describe('where the payment gate returns a member', () => {
    it('adds the result to the address of the community room', () => {
        expect(createCommunityMembershipCheckoutUrls(COMMUNITY_ROOM_URL)).toEqual({
            successUrl: `${COMMUNITY_ROOM_URL}?membership=paid&checkoutSession=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
            cancelUrl: `${COMMUNITY_ROOM_URL}?membership=cancelled`,
        });
    });

    it('keeps the occurrence a workshop room is addressed by instead of starting a second question mark', () => {
        const { successUrl, cancelUrl } = createCommunityMembershipCheckoutUrls(WORKSHOP_ROOM_URL);

        expect(successUrl).toBe(
            'https://ptbk.io/cs/online-workshop/participant?workshop=produkcni-kod-s-ai-agenty' +
                `&membership=paid&checkoutSession=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
        );
        expect(cancelUrl).toBe(
            'https://ptbk.io/cs/online-workshop/participant?workshop=produkcni-kod-s-ai-agenty&membership=cancelled',
        );

        // The occurrence must still be readable, which a second `?` would have hidden inside the value before it.
        expect(new URL(successUrl).searchParams.get('workshop')).toBe('produkcni-kod-s-ai-agenty');
        expect(new URL(successUrl).searchParams.get('membership')).toBe('paid');
    });

    it('leaves the placeholder of the finished checkout unescaped, which is the only form the gate replaces', () => {
        const { successUrl } = createCommunityMembershipCheckoutUrls(WORKSHOP_ROOM_URL);

        expect(successUrl).toContain(`checkoutSession=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`);
        expect(successUrl).not.toContain('%7BCHECKOUT_SESSION_ID%7D');
    });
});
