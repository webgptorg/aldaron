import type { CommunityMembershipRecord } from '@/lib/community-membership/communityMembershipDatabase';
import { createCommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipRoomState';
import type { StoredCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import type { StripeConfiguration } from '@/lib/payments/stripeConfiguration';
import { describe, expect, it } from 'vitest';

const TEST_GATE: StripeConfiguration = {
    secretKey: 'sk_test_51Example',
    webhookSigningSecret: 'whsec_Example',
    isTestMode: true,
};

const LIVE_GATE: StripeConfiguration = {
    secretKey: 'sk_live_51Example',
    webhookSigningSecret: 'whsec_Example',
    isTestMode: false,
};

function createMembership(
    status: StoredCommunityMembershipStatus,
    isCancellationScheduled: boolean = false,
): CommunityMembershipRecord {
    return {
        id: '5f2b0a2e-2c1f-4f0e-9a4a-70c4b0e2c111',
        email: 'jana@example.com',
        fullname: 'Jana Nováková',
        planId: 'membership',
        status,
        monthlyPriceCzk: 199,
        discountCode: null,
        discountPercent: 0,
        stripeCustomerId: 'cus_Example',
        stripeSubscriptionId: 'sub_Example',
        stripeCheckoutSessionId: 'cs_test_Example',
        isTestPayment: true,
        isCancellationScheduled,
        currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
        activatedAt: '2026-08-30T10:00:00.000Z',
        canceledAt: null,
        createdAt: '2026-08-29T10:00:00.000Z',
        updatedAt: '2026-08-30T10:00:00.000Z',
    };
}

describe('community membership room state', () => {
    it('offers the membership to a member who never bought one', () => {
        expect(createCommunityMembershipRoomState(null, LIVE_GATE)).toEqual({
            status: 'none',
            monthlyPriceCzk: null,
            currentPeriodEndsAt: null,
            isCancellationScheduled: false,
            isPurchaseOffered: true,
            isSubscriptionManagementOffered: false,
            isPaymentInTestMode: false,
        });
    });

    it('offers nothing where the server was given no payment gate', () => {
        expect(createCommunityMembershipRoomState(null, null).isPurchaseOffered).toBe(false);
    });

    it('stops offering a membership which is already being paid for', () => {
        expect(createCommunityMembershipRoomState(createMembership('active'), LIVE_GATE)).toEqual({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isCancellationScheduled: false,
            isPurchaseOffered: false,
            isSubscriptionManagementOffered: true,
            isPaymentInTestMode: false,
        });
    });

    it('keeps a membership whose last payment failed, without offering it again', () => {
        const roomState = createCommunityMembershipRoomState(createMembership('past-due'), LIVE_GATE);

        expect(roomState.status).toBe('past-due');
        expect(roomState.isPurchaseOffered).toBe(false);
    });

    it('keeps a scheduled cancellation paid and manageable through the final paid day', () => {
        const roomState = createCommunityMembershipRoomState(createMembership('active', true), LIVE_GATE);

        expect(roomState.status).toBe('active');
        expect(roomState.isCancellationScheduled).toBe(true);
        expect(roomState.isPurchaseOffered).toBe(false);
        expect(roomState.isSubscriptionManagementOffered).toBe(true);
    });

    it('offers the membership again once it was cancelled or never finished', () => {
        expect(createCommunityMembershipRoomState(createMembership('canceled'), LIVE_GATE).isPurchaseOffered).toBe(true);
        expect(createCommunityMembershipRoomState(createMembership('pending'), LIVE_GATE).isPurchaseOffered).toBe(true);
    });

    it('says when the gate it would pay through is the test one', () => {
        expect(createCommunityMembershipRoomState(null, TEST_GATE).isPaymentInTestMode).toBe(true);
    });
});
