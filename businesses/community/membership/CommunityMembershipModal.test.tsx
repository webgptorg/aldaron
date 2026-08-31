/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_PATH } from '@/businesses/community/config';
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
const confirmCommunityMembershipCheckout = vi.fn<(checkoutSessionId: string) => Promise<CommunityMembershipRoomState>>();
const startCommunityMembershipCheckout = vi.fn();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: () => fetchCommunityMembership(),
    confirmCommunityMembershipCheckout: (checkoutSessionId: string) =>
        confirmCommunityMembershipCheckout(checkoutSessionId),
    startCommunityMembershipCheckout: (values: unknown) => startCommunityMembershipCheckout(values),
}));

import { CommunityMembershipRoomProvider } from './CommunityMembershipRoomProvider';
import { CommunityMembershipBadge } from './CommunityMembershipBadge';
import { CommunityMembershipModal } from './CommunityMembershipModal';

const OFFERED_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isPurchaseOffered: true,
    isPaymentInTestMode: false,
};

function renderMembershipModal() {
    render(
        <CommunityMembershipRoomProvider>
            <CommunityMembershipBadge />
            <CommunityMembershipModal />
        </CommunityMembershipRoomProvider>,
    );
}

async function openFreeMembershipModal() {
    fireEvent.click(await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' }));
    return screen.findByRole('dialog');
}

async function openPaidMembershipModal() {
    fireEvent.click(await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' }));
    return screen.findByRole('dialog');
}

beforeEach(() => {
    window.history.replaceState({}, '', COMMUNITY_PATH);
    fetchCommunityMembership.mockResolvedValue(OFFERED_MEMBERSHIP);
    confirmCommunityMembershipCheckout.mockResolvedValue(OFFERED_MEMBERSHIP);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community membership modal', () => {
    it('opens the in-room offer for its monthly price from the free membership badge', async () => {
        renderMembershipModal();

        await openFreeMembershipModal();

        expect(await screen.findByRole('button', { name: 'Zaplatit 199 Kč / měsíc' })).toBeDefined();
        expect(screen.getByText('Záznamy a archiv webinářů')).toBeDefined();
    });

    it('says nothing about a test card while the gate charges real money', async () => {
        renderMembershipModal();

        await openFreeMembershipModal();

        await screen.findByRole('button', { name: 'Zaplatit 199 Kč / měsíc' });
        expect(screen.queryByText(/Testovací režim/)).toBeNull();
    });

    it('names the test card while the gate is the test one', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...OFFERED_MEMBERSHIP, isPaymentInTestMode: true });
        renderMembershipModal();

        await openFreeMembershipModal();

        expect(await screen.findByText(/Testovací režim platební brány/)).toBeDefined();
        expect(screen.getByText('4242 4242 4242 4242')).toBeDefined();
    });

    it('celebrates a paid membership instead of selling it again', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 149,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        await openPaidMembershipModal();

        expect(await screen.findByText('Placené členství je aktivní')).toBeDefined();
        expect(screen.getByText(/Platíte 149 Kč měsíčně\. Zaplaceno do 30\. 9\. 2026\./)).toBeDefined();
        expect(screen.queryByRole('button', { name: /Zaplatit/ })).toBeNull();
    });

    it('says that a failed payment keeps the membership for now', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'past-due',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: null,
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        await openPaidMembershipModal();

        expect(await screen.findByText(/Poslední platba neprošla/)).toBeDefined();
    });

    it('says nothing at all where the server has no payment gate', async () => {
        fetchCommunityMembership.mockResolvedValue({ ...OFFERED_MEMBERSHIP, isPurchaseOffered: false });
        renderMembershipModal();

        await vi.waitFor(() => expect(screen.queryByText('Placené členství komunity')).toBeNull());
        expect(fetchCommunityMembership).toHaveBeenCalled();
    });

    it('confirms the checkout a returning member came back from and celebrates it', async () => {
        window.history.replaceState({}, '', `${COMMUNITY_PATH}?membership=paid&checkoutSession=cs_test_Example`);
        confirmCommunityMembershipCheckout.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: '2026-09-30T10:00:00.000Z',
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderMembershipModal();

        expect(await screen.findByRole('dialog')).toBeDefined();
        expect(await screen.findByText('Platba proběhla. Placené členství je vaše, díky!')).toBeDefined();
        expect(confirmCommunityMembershipCheckout).toHaveBeenCalledWith('cs_test_Example');
        expect(fetchCommunityMembership).not.toHaveBeenCalled();
        // The address stops confirming that payment, so reloading the room does not celebrate it a second time.
        expect(window.location.search).toBe('');
    });

    it('says that a member who came back without paying can buy the membership later', async () => {
        window.history.replaceState({}, '', `${COMMUNITY_PATH}?membership=cancelled`);
        renderMembershipModal();

        expect(await screen.findByRole('dialog')).toBeDefined();
        expect(
            await screen.findByText('Platba nebyla dokončena. Členství si můžete pořídit kdykoli později.'),
        ).toBeDefined();
        expect(confirmCommunityMembershipCheckout).not.toHaveBeenCalled();
    });
});
