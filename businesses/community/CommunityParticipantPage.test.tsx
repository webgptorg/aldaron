/**
 * @vitest-environment jsdom
 */

import type { CommunityMembershipRoomState } from '@/lib/community-membership/communityMembershipTypes';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCommunityMembership = vi.fn<() => Promise<CommunityMembershipRoomState>>();

vi.mock('@/businesses/community/membership/communityMembershipRoomApi', () => ({
    fetchCommunityMembership: () => fetchCommunityMembership(),
    confirmCommunityMembershipCheckout: vi.fn(),
    startCommunityMembershipCheckout: vi.fn(),
}));

vi.mock('@/businesses/community/projects/CommunityProjectsSection', () => ({
    CommunityProjectsSection: () => null,
}));

// The checkbox of the design system measures itself, which the test document cannot do.
vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: (props: Record<string, unknown>) => <input type="checkbox" aria-label={String(props['aria-label'])} />,
}));

vi.mock('@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage', () => ({
    OnlineWorkshopParticipantPage: ({
        participantHeaderSupplement,
        mainContentAfterWorkshopNavigation,
    }: {
        readonly participantHeaderSupplement?: ReactNode;
        readonly mainContentAfterWorkshopNavigation?: ReactNode;
    }) => (
        <main>
            {participantHeaderSupplement}
            {mainContentAfterWorkshopNavigation}
        </main>
    ),
}));

import { CommunityParticipantPage } from './CommunityParticipantPage';

const COMMUNITY: WorkshopDetails = {
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    event: null,
    slug: 'komunita',
    title: 'Komunita Promptbooku',
    description: 'Prostor pro členy komunity.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: null,
    youtubeVideoId: null,
    isPublished: true,
    allowedReactions: [],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

const FREE_MEMBERSHIP: CommunityMembershipRoomState = {
    status: 'none',
    monthlyPriceCzk: null,
    currentPeriodEndsAt: null,
    isPurchaseOffered: true,
    isPaymentInTestMode: false,
};

function renderCommunityRoom() {
    render(<CommunityParticipantPage community={COMMUNITY} workshops={[]} initialEmail="" initialFullname="" />);
}

beforeEach(() => {
    window.history.replaceState({}, '', '/cs/komunita');
    fetchCommunityMembership.mockResolvedValue(FREE_MEMBERSHIP);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('community participant page', () => {
    it('opens the membership modal from the free member header badge without placing it among room content', async () => {
        renderCommunityRoom();

        const membershipBadge = await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(screen.queryByRole('dialog')).toBeNull();

        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství komunity' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Zaplatit 199 Kč / měsíc' })).toBeDefined();
    });

    it('says in the header that a paying member already has the paid membership', async () => {
        fetchCommunityMembership.mockResolvedValue({
            status: 'active',
            monthlyPriceCzk: 199,
            currentPeriodEndsAt: null,
            isPurchaseOffered: false,
            isPaymentInTestMode: false,
        });
        renderCommunityRoom();

        const membershipBadge = await screen.findByRole('button', { name: 'Placené členství. Otevřít stav členství' });
        fireEvent.click(membershipBadge);

        expect(await screen.findByRole('dialog', { name: 'Placené členství je aktivní' })).toBeDefined();
        expect(screen.queryByRole('button', { name: /Free členství/ })).toBeNull();
    });

    it('asks for the membership of the member once, however many surfaces of the room show it', async () => {
        renderCommunityRoom();

        await screen.findByRole('button', { name: 'Free členství. Otevřít možnosti členství' });
        expect(fetchCommunityMembership).toHaveBeenCalledTimes(1);
    });
});
