import {
    COMMUNITY_MEMBERSHIP_CANCELLED_RESULT,
    COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME,
    COMMUNITY_MEMBERSHIP_PAID_RESULT,
    COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME,
} from '@/businesses/community/config';
import {
    COMMUNITY_MEMBERSHIP_NAME,
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN,
} from '@/businesses/community/membership/communityMembershipConfig';
import type { CommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';
import { createStripeAmountFromCzk, STRIPE_CZK_CURRENCY } from '@/lib/payments/stripeAmount';
import type { StripeGateway } from '@/lib/payments/stripeGateway';
import type Stripe from 'stripe';

/**
 * Placeholder the payment gate replaces with the id of the session a member is returning from
 */
export const STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';

/**
 * How every checkout session of the gate is named, and how long an identifier of it may possibly be
 */
const STRIPE_CHECKOUT_SESSION_ID_PREFIX = 'cs_';
const MAXIMAL_STRIPE_CHECKOUT_SESSION_ID_LENGTH = 255;

/**
 * Whether a returning browser named something which can be a checkout session at all, before the gate is asked about it
 */
export function isStripeCheckoutSessionId(value: unknown): value is string {
    return (
        typeof value === 'string' &&
        value.startsWith(STRIPE_CHECKOUT_SESSION_ID_PREFIX) &&
        value.length <= MAXIMAL_STRIPE_CHECKOUT_SESSION_ID_LENGTH
    );
}

/**
 * How a membership recognises itself in everything the payment gate stores about it.
 *
 * Note: A subscription is charged for years after the room session which bought it has expired, so it carries the
 *       address of its member rather than the room identity which happened to open the checkout.
 */
export const COMMUNITY_MEMBERSHIP_METADATA_KEYS = {
    memberEmail: 'communityMemberEmail',
    memberFullname: 'communityMemberFullname',
    participantId: 'communityParticipantId',
    planId: 'communityMembershipPlanId',
    discountCode: 'communityMembershipDiscountCode',
} as const;

export type CommunityMembershipCheckoutMember = {
    readonly participantId: string;
    readonly fullname: string;
    readonly email: string;
};

export type CommunityMembershipCheckoutUrls = {
    /**
     * Where a paid member returns, which must carry {@link STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER} so the return can be
     * confirmed against the gate
     */
    readonly successUrl: string;
    readonly cancelUrl: string;
};

/**
 * Where the gate sends a member back to, both when they paid and when they changed their mind.
 *
 * Note: The placeholder of the finished checkout is written into the address by hand, because the gate replaces it
 *       only where it stands unescaped.
 */
export function createCommunityMembershipCheckoutUrls(communityRoomUrl: string): CommunityMembershipCheckoutUrls {
    return {
        successUrl:
            `${communityRoomUrl}?${COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME}=${COMMUNITY_MEMBERSHIP_PAID_RESULT}` +
            `&${COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME}=${STRIPE_CHECKOUT_SESSION_ID_PLACEHOLDER}`,
        cancelUrl: `${communityRoomUrl}?${COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME}=${COMMUNITY_MEMBERSHIP_CANCELLED_RESULT}`,
    };
}

function createCommunityMembershipMetadata(
    member: CommunityMembershipCheckoutMember,
    discountCode: string | null,
): Stripe.MetadataParam {
    return {
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberEmail]: normalizeCommunityMemberEmail(member.email),
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.memberFullname]: member.fullname,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.participantId]: member.participantId,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.planId]: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.id,
        [COMMUNITY_MEMBERSHIP_METADATA_KEYS.discountCode]: discountCode ?? '',
    };
}

/**
 * Opens the checkout of the payment gate for one member of the community.
 *
 * Note: The recurring price is described in the request itself instead of pointing at a price prepared in the gate.
 *       The monthly price of the membership, and the discount a member is entitled to, therefore stay decided by this
 *       application alone, and configuring the gate is nothing but giving this server its keys.
 */
export async function createCommunityMembershipCheckoutSession(
    gateway: StripeGateway,
    member: CommunityMembershipCheckoutMember,
    price: CommunityMembershipPrice,
    discountCode: string | null,
    urls: CommunityMembershipCheckoutUrls,
): Promise<Stripe.Checkout.Session> {
    const metadata = createCommunityMembershipMetadata(member, discountCode);

    return gateway.stripe.checkout.sessions.create({
        mode: 'subscription',
        locale: 'cs',
        customer_email: normalizeCommunityMemberEmail(member.email),
        client_reference_id: member.participantId,
        success_url: urls.successUrl,
        cancel_url: urls.cancelUrl,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: STRIPE_CZK_CURRENCY,
                    unit_amount: createStripeAmountFromCzk(price.finalMonthlyEquivalentCzk),
                    recurring: { interval: 'month' },
                    product_data: {
                        name: `${COMMUNITY_MEMBERSHIP_NAME} – ${CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.name}`,
                        description: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN.description,
                    },
                },
            },
        ],
        metadata,
        subscription_data: { metadata },
    });
}
