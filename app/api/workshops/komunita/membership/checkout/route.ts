import { COMMUNITY_PATH } from '@/businesses/community/config';
import {
    CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
} from '@/businesses/community/membership/communityMembershipConfig';
import { createCommunityMembershipPrice } from '@/businesses/community/membership/communityMembershipPrice';
import { createRequestSiteUrl } from '@/lib/api/createRequestSiteUrl';
import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    getAuthenticatedCommunityRequest,
    isAuthenticatedCommunityRequest,
} from '@/lib/community/communityRequest';
import {
    createCommunityMembershipCheckoutSession,
    createCommunityMembershipCheckoutUrls,
} from '@/lib/community-membership/communityMembershipCheckout';
import {
    loadCommunityMembershipByEmail,
    saveRequestedCommunityMembership,
} from '@/lib/community-membership/communityMembershipDatabase';
import { COMMUNITY_MEMBERSHIP_MESSAGES } from '@/lib/community-membership/communityMembershipMessages';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { normalizeDiscountCode } from '@/lib/discounts/discountCode';
import { MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscount } from '@/lib/discounts/discountCodeDatabase';
import { COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID } from '@/lib/discounts/discountPlaces';
import { getStripeGatewayOrNull } from '@/lib/payments/stripeGateway';
import { NextRequest, NextResponse } from 'next/server';

const MONTHLY_BILLING_PERIOD = 'monthly' as const;

type CommunityMembershipCheckoutRequest = {
    readonly discountCode: string;
};

function readCheckoutRequest(body: Readonly<Record<string, unknown>>): CommunityMembershipCheckoutRequest | null {
    const discountCode = body.discountCode ?? '';

    if (
        body.termsAccepted !== true ||
        typeof discountCode !== 'string' ||
        discountCode.length > MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH
    ) {
        return null;
    }

    return { discountCode };
}

/**
 * Opens the payment gate for the connected member and remembers the offer they accepted.
 *
 * Note: Neither the price nor the identity of the member is read from the request. The membership is charged for what
 *       this application says it costs, to the address the community session was opened with, so nothing a browser
 *       sends can buy a membership cheaper or for somebody else.
 */
export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityRequest(request);
    if (!isAuthenticatedCommunityRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const body = await readJsonObjectOrNull(request);
    const checkoutRequest = body === null ? null : readCheckoutRequest(body);
    if (checkoutRequest === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.termsNotAccepted }, { status: 400 });
    }

    const gateway = getStripeGatewayOrNull();
    if (gateway === null) {
        console.error('The community membership cannot be bought without STRIPE_SECRET_KEY, see AGENT_MESSAGE.md.');
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentGateUnavailable }, { status: 503 });
    }

    const { participant, supabase } = authenticatedRequest;
    const currentMembership = await loadCommunityMembershipByEmail(supabase, participant.email);
    if (currentMembership.errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipNotLoaded }, { status: 500 });
    }
    if (currentMembership.membership !== null && isPaidCommunityMembershipStatus(currentMembership.membership.status)) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.membershipAlreadyPaid }, { status: 409 });
    }

    const normalizedDiscountCode = normalizeDiscountCode(checkoutRequest.discountCode);
    const { activeDiscount, errorMessage: discountErrorMessage } = await loadActiveDiscount(
        checkoutRequest.discountCode,
        COMMUNITY_MEMBERSHIP_DISCOUNT_PLACE_ID,
    );
    if (discountErrorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotLoaded }, { status: 503 });
    }
    if (normalizedDiscountCode !== '' && activeDiscount === null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.discountCodeNotActive }, { status: 409 });
    }

    const price = createCommunityMembershipPrice(
        CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
        MONTHLY_BILLING_PERIOD,
        activeDiscount,
    );

    let checkoutSession;
    try {
        checkoutSession = await createCommunityMembershipCheckoutSession(
            gateway,
            { participantId: participant.id, fullname: participant.fullname, email: participant.email },
            price,
            activeDiscount?.code ?? null,
            createCommunityMembershipCheckoutUrls(createRequestSiteUrl(request, COMMUNITY_PATH)),
        );
    } catch (error) {
        console.error('Failed to open the community membership checkout:', error);
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
    }

    if (checkoutSession.url === null) {
        console.error('The community membership checkout was opened without an address to send the member to.');
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 502 });
    }

    const { errorMessage } = await saveRequestedCommunityMembership(
        supabase,
        currentMembership.membership?.id ?? null,
        {
            email: participant.email,
            fullname: participant.fullname,
            planId: CURRENT_PAID_COMMUNITY_MEMBERSHIP_PLAN_ID,
            monthlyPriceCzk: price.finalMonthlyEquivalentCzk,
            discountCode: activeDiscount?.code ?? null,
            discountPercent: activeDiscount?.percent ?? 0,
            stripeCheckoutSessionId: checkoutSession.id,
            isTestPayment: gateway.configuration.isTestMode,
            requestedByParticipantId: participant.id,
        },
    );
    if (errorMessage !== null) {
        return NextResponse.json({ error: COMMUNITY_MEMBERSHIP_MESSAGES.paymentNotOpened }, { status: 500 });
    }

    return NextResponse.json(
        { checkoutUrl: checkoutSession.url },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
