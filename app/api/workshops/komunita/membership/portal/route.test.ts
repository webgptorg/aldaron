import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
    createPortalSessionMock,
    getAuthenticatedCommunityRequestMock,
    getCrossSiteResponseOrNullMock,
    getStripeGatewayOrNullMock,
    isAuthenticatedCommunityRequestMock,
    loadCommunityMembershipByEmailMock,
} = vi.hoisted(() => ({
    createPortalSessionMock: vi.fn(),
    getAuthenticatedCommunityRequestMock: vi.fn(),
    getCrossSiteResponseOrNullMock: vi.fn(),
    getStripeGatewayOrNullMock: vi.fn(),
    isAuthenticatedCommunityRequestMock: vi.fn(),
    loadCommunityMembershipByEmailMock: vi.fn(),
}));

vi.mock('@/lib/api/getCrossSiteResponseOrNull', () => ({
    getCrossSiteResponseOrNull: getCrossSiteResponseOrNullMock,
}));
vi.mock('@/lib/community/communityRequest', () => ({
    getAuthenticatedCommunityRequest: getAuthenticatedCommunityRequestMock,
    isAuthenticatedCommunityRequest: isAuthenticatedCommunityRequestMock,
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    loadCommunityMembershipByEmail: loadCommunityMembershipByEmailMock,
}));
vi.mock('@/lib/payments/stripeGateway', () => ({
    getStripeGatewayOrNull: getStripeGatewayOrNullMock,
}));

import { POST } from './route';

const SUPABASE = {};
const AUTHENTICATED_REQUEST = {
    participant: { email: 'jana@example.com' },
    supabase: SUPABASE,
};
const MEMBERSHIP: CommunityMembershipRecord = {
    id: 'membership-1',
    email: 'jana@example.com',
    fullname: 'Jana Nováková',
    planId: 'membership',
    status: 'active',
    monthlyPriceCzk: 199,
    discountCode: null,
    discountPercent: 0,
    stripeCustomerId: 'cus_Example',
    stripeSubscriptionId: 'sub_Example',
    stripeCheckoutSessionId: 'cs_Example',
    isTestPayment: false,
    isCancellationScheduled: false,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    activatedAt: '2026-08-30T10:00:00.000Z',
    canceledAt: null,
    createdAt: '2026-08-29T10:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z',
};
const PORTAL_SESSION = { url: 'https://billing.stripe.com/p/session/test_Example' };
const GATEWAY = {
    stripe: { billingPortal: { sessions: { create: createPortalSessionMock } } },
};

function createRequest(): NextRequest {
    return new NextRequest('https://promptbook.studio/api/workshops/komunita/membership/portal', {
        method: 'POST',
        headers: { 'sec-fetch-site': 'same-origin' },
    });
}

describe('community membership Stripe portal endpoint', () => {
    beforeEach(() => {
        createPortalSessionMock.mockReset();
        getAuthenticatedCommunityRequestMock.mockReset();
        getCrossSiteResponseOrNullMock.mockReset();
        getStripeGatewayOrNullMock.mockReset();
        isAuthenticatedCommunityRequestMock.mockReset();
        loadCommunityMembershipByEmailMock.mockReset();

        getCrossSiteResponseOrNullMock.mockReturnValue(null);
        getAuthenticatedCommunityRequestMock.mockResolvedValue(AUTHENTICATED_REQUEST);
        isAuthenticatedCommunityRequestMock.mockReturnValue(true);
        getStripeGatewayOrNullMock.mockReturnValue(GATEWAY);
        loadCommunityMembershipByEmailMock.mockResolvedValue({ membership: MEMBERSHIP, errorMessage: null });
        createPortalSessionMock.mockResolvedValue(PORTAL_SESSION);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('opens a short-lived portal for the signed-in member and returns to their community room', async () => {
        const response = await POST(createRequest());

        expect(response.status).toBe(200);
        expect(createPortalSessionMock).toHaveBeenCalledWith({
            customer: 'cus_Example',
            return_url: 'https://promptbook.studio/cs/komunita',
        });
        expect(await response.json()).toEqual({ portalUrl: PORTAL_SESSION.url });
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });

    it('refuses a cross-site request before it can reach a member or Stripe', async () => {
        getCrossSiteResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 }),
        );

        const response = await POST(createRequest());

        expect(response.status).toBe(403);
        expect(getAuthenticatedCommunityRequestMock).not.toHaveBeenCalled();
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('does not create a portal for an unpaid membership or one without a Stripe customer', async () => {
        loadCommunityMembershipByEmailMock.mockResolvedValue({
            membership: { ...MEMBERSHIP, stripeCustomerId: null },
            errorMessage: null,
        });

        const response = await POST(createRequest());

        expect(response.status).toBe(409);
        expect(createPortalSessionMock).not.toHaveBeenCalled();
    });

    it('answers with a usable error when Stripe cannot create the portal', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        createPortalSessionMock.mockRejectedValue(new Error('Customer portal is not configured'));

        const response = await POST(createRequest());

        expect(response.status).toBe(502);
        expect(await response.json()).toEqual({
            error: 'Správu plateb ve Stripe se teď nepodařilo otevřít. Zkuste to prosím znovu.',
        });
    });
});
