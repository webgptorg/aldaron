/**
 * @vitest-environment jsdom
 */

import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { InputHTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The checkbox of the design system measures itself, which the test document cannot do.
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

const fetchCommunityMembership = vi.fn<() => Promise<CommunityMembershipRoomState>>();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: () => fetchCommunityMembership(),
    confirmCommunityMembershipCheckout: vi.fn(),
    startCommunityMembershipCheckout: vi.fn(),
}));

import { CommunityMembershipBadge } from './CommunityMembershipBadge';
import { CommunityMembershipModal } from './CommunityMembershipModal';
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
            <CommunityMembershipModal />
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
    it('identifies the free tier and opens the offer in a modal in the very same room', async () => {
        renderMembershipBadge();

        const membershipBadge = await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
    });

    it('opens the paid membership state for a paying member', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: null,
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderMembershipBadge();

        const membershipBadge = await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství je aktivní' })).toBeDefined();
        expect(screen.queryByRole('button', { name: /Zaplatit/ })).toBeNull();
    });

    it('claims no membership at all while it is unknown or cannot be bought', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...FREE_MEMBERSHIP, isPurchaseOffered: false });
        renderMembershipBadge();

        await vi.waitFor(() => expect(fetchCommunityMembership).toHaveBeenCalled());
        expect(screen.queryByText(/členství/i)).toBeNull();
    });
});
