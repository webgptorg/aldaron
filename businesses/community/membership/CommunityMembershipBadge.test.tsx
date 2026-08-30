/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_MEMBERSHIP_SECTION_ID } from '@/businesses/community/config';
import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCommunityMembership = vi.fn<() => Promise<CommunityMembershipRoomState>>();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: () => fetchCommunityMembership(),
    confirmCommunityMembershipCheckout: vi.fn(),
    startCommunityMembershipCheckout: vi.fn(),
}));

import { CommunityMembershipBadge } from './CommunityMembershipBadge';
import { CommunityMembershipRoomProvider } from './CommunityMembershipRoomProvider';

const FREE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isPurchaseOffered: true,
    isPaymentInTestMode: false,
};

function renderMembershipBadge() {
    render(
        <CommunityMembershipRoomProvider>
            <CommunityMembershipBadge />
        </CommunityMembershipRoomProvider>,
    );
}

beforeEach(() => {
    window.history.replaceState({}, '', '/cs/komunita');
    fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community membership badge', () => {
    it('identifies the free tier and leads to the offer in the very same room', async () => {
        renderMembershipBadge();

        const membershipBadge = await screen.findByRole('link', { name: 'Free členství. Přejít na placené členství' });
        expect(membershipBadge.getAttribute('href')).toBe(`#${COMMUNITY_MEMBERSHIP_SECTION_ID}`);
    });

    it('identifies a paying member without offering them anything', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: null,
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderMembershipBadge();

        expect(await screen.findByText('Placené členství')).toBeDefined();
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('claims no membership at all while it is unknown or cannot be bought', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...FREE_MEMBERSHIP, isPurchaseOffered: false });
        renderMembershipBadge();

        await vi.waitFor(() => expect(fetchCommunityMembership).toHaveBeenCalled());
        expect(screen.queryByText(/členství/i)).toBeNull();
    });
});
