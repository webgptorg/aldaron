import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    applyCommunityMembershipSubscriptionChangeMock,
    createCommunityMembershipRoomStateMock,
    getAuthenticatedCommunityRequestMock,
    getCrossSiteResponseOrNullMock,
    getStripeGatewayOrNullMock,
    isAuthenticatedCommunityRequestMock,
    loadCommunityMembershipByEmailMock,
    updateStripeSubscriptionMock,
} = vi.hoisted(() => ({
    applyCommunityMembershipSubscriptionChangeMock: vi.fn(),
    createCommunityMembershipRoomStateMock: vi.fn(),
    getAuthenticatedCommunityRequestMock: vi.fn(),
    getCrossSiteResponseOrNullMock: vi.fn(),
    getStripeGatewayOrNullMock: vi.fn(),
    isAuthenticatedCommunityRequestMock: vi.fn(),
    loadCommunityMembershipByEmailMock: vi.fn(),
    updateStripeSubscriptionMock: vi.fn(),
}));

vi.mock('@/lib/api/getCrossSiteResponseOrNull', () => ({
    getCrossSiteResponseOrNull: getCrossSiteResponseOrNullMock,
}));
vi.mock('@/lib/community/communityRequest', () => ({
    getAuthenticatedCommunityRequest: getAuthenticatedCommunityRequestMock,
    isAuthenticatedCommunityRequest: isAuthenticatedCommunityRequestMock,
}));
vi.mock('@/lib/community-membership/communityMembershipActivation', () => ({
    applyCommunityMembershipSubscriptionChange: applyCommunityMembershipSubscriptionChangeMock,
}));
vi.mock('@/lib/community-membership/communityMembershipDatabase', () => ({
    loadCommunityMembershipByEmail: loadCommunityMembershipByEmailMock,
}));
vi.mock('@/lib/community-membership/communityMembershipRoomState', () => ({
    createCommunityMembershipRoomState: createCommunityMembershipRoomStateMock,
}));
vi.mock('@/lib/payments/stripeGateway', () => ({
    getStripeGatewayOrNull: getStripeGatewayOrNullMock,
}));

import { DELETE, POST } from './route';

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
const ROOM_STATE: CommunityMembershipRoomState = {
    status: 'active',
    monthlyPriceCzk: 199,
    currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
    isCancellationScheduled: true,
    isPurchaseOffered: false,
    isSubscriptionManagementOffered: true,
    isPaymentInTestMode: false,
};
const UPDATED_SUBSCRIPTION = { id: 'sub_Example' };
const GATEWAY = {
    stripe: { subscriptions: { update: updateStripeSubscriptionMock } },
    configuration: { isTestMode: false },
};

function createRequest(method: 'POST' | 'DELETE'): NextRequest {
    return new NextRequest('https://promptbook.studio/api/workshops/komunita/membership/cancellation', {
        method,
        headers: { 'sec-fetch-site': 'same-origin' },
    });
}

describe('community membership cancellation endpoint', () => {
    beforeEach(() => {
        applyCommunityMembershipSubscriptionChangeMock.mockReset();
        createCommunityMembershipRoomStateMock.mockReset();
        getAuthenticatedCommunityRequestMock.mockReset();
        getCrossSiteResponseOrNullMock.mockReset();
        getStripeGatewayOrNullMock.mockReset();
        isAuthenticatedCommunityRequestMock.mockReset();
        loadCommunityMembershipByEmailMock.mockReset();
        updateStripeSubscriptionMock.mockReset();

        getCrossSiteResponseOrNullMock.mockReturnValue(null);
        getAuthenticatedCommunityRequestMock.mockResolvedValue(AUTHENTICATED_REQUEST);
        isAuthenticatedCommunityRequestMock.mockReturnValue(true);
        getStripeGatewayOrNullMock.mockReturnValue(GATEWAY);
        loadCommunityMembershipByEmailMock.mockResolvedValue({ membership: MEMBERSHIP, errorMessage: null });
        updateStripeSubscriptionMock.mockResolvedValue(UPDATED_SUBSCRIPTION);
        applyCommunityMembershipSubscriptionChangeMock.mockResolvedValue({ errorMessage: null });
        createCommunityMembershipRoomStateMock.mockReturnValue(ROOM_STATE);
    });

    it('schedules the next renewal for cancellation and mirrors the returned Stripe state', async () => {
        const response = await POST(createRequest('POST'));

        expect(response.status).toBe(200);
        expect(updateStripeSubscriptionMock).toHaveBeenCalledWith('sub_Example', { cancel_at_period_end: true });
        expect(applyCommunityMembershipSubscriptionChangeMock).toHaveBeenCalledWith(SUPABASE, UPDATED_SUBSCRIPTION);
        expect(createCommunityMembershipRoomStateMock).toHaveBeenCalledWith(MEMBERSHIP, GATEWAY.configuration);
        expect(await response.json()).toEqual(ROOM_STATE);
    });

    it('removes the scheduled cancellation to reactivate automatic renewal', async () => {
        await DELETE(createRequest('DELETE'));

        expect(updateStripeSubscriptionMock).toHaveBeenCalledWith('sub_Example', { cancel_at_period_end: false });
    });

    it('refuses a cross-site request before it can reach a member or Stripe', async () => {
        getCrossSiteResponseOrNullMock.mockReturnValue(
            NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 }),
        );

        const response = await POST(createRequest('POST'));

        expect(response.status).toBe(403);
        expect(getAuthenticatedCommunityRequestMock).not.toHaveBeenCalled();
        expect(updateStripeSubscriptionMock).not.toHaveBeenCalled();
    });

    it('does not manage a membership that has no active Stripe subscription', async () => {
        loadCommunityMembershipByEmailMock.mockResolvedValue({
            membership: { ...MEMBERSHIP, stripeSubscriptionId: null },
            errorMessage: null,
        });

        const response = await POST(createRequest('POST'));

        expect(response.status).toBe(409);
        expect(updateStripeSubscriptionMock).not.toHaveBeenCalled();
    });
});
