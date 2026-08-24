/**
 * @vitest-environment jsdom
 */

import {
    OnlineWorkshopParticipantPage,
    type WorkshopNavigationDetails,
} from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { WorkshopDetails, WorkshopPublicState } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The room as far as this page is concerned: a loaded state and the actions it offers
 */
const participantMocks = vi.hoisted(() => ({ controller: null as unknown }));

vi.mock('@/businesses/online-workshop/participant/useWorkshopParticipant', () => ({
    useWorkshopParticipant: () => participantMocks.controller,
}));

const WORKSHOP: WorkshopDetails = {
    id: '5a7eb2ad-2583-4e98-9640-50bc773b5fde',
    kind: 'workshop',
    slug: 'produkcni-kod-2026-08-21',
    title: 'Produkční kód s AI agenty',
    description: 'Online workshop s Pavolem Hejným a Jiřím Jahnem.',
    startsAt: '2026-08-21T19:00:00+02:00',
    endsAt: '2026-08-21T20:30:00+02:00',
    youtubeVideoId: 'dQw4w9WgXcQ',
    isPublished: true,
    allowedReactions: ['👍'],
    disabledPanels: [],
    createdAt: '2026-08-01T10:00:00+02:00',
    updatedAt: '2026-08-01T10:00:00+02:00',
};

/**
 * Note: The community deliberately keeps a stored stream and a stored start, so these tests prove that the kind of
 *       the room takes the stage and the countdown away rather than an empty setting doing it by accident.
 */
const COMMUNITY: WorkshopDetails = {
    ...WORKSHOP,
    id: '0d6b0f1c-9b0a-4b7e-9c02-6f2f7a3f5f31',
    kind: 'community',
    slug: 'komunita',
    title: 'Komunita Promptbooku',
};

/**
 * The workshops a permanent room such as the community leads to
 */
const WORKSHOP_NAVIGATION: WorkshopNavigationDetails = {
    workshops: [
        {
            id: WORKSHOP.id,
            kind: WORKSHOP.kind,
            slug: WORKSHOP.slug,
            title: WORKSHOP.title,
            startsAt: WORKSHOP.startsAt,
            endsAt: WORKSHOP.endsAt,
            isPublished: WORKSHOP.isPublished,
        },
    ],
    participantPath: '/cs/online-workshop/participant',
    title: 'Workshopy Promptbooku',
    description: 'Vyberte si workshop.',
    emptyMessage: 'Žádný workshop není dostupný.',
    locale: 'cs-CZ',
    timeZone: 'Europe/Prague',
};

function renderParticipantRoom(workshop: WorkshopDetails, workshopNavigation?: WorkshopNavigationDetails) {
    const state: WorkshopPublicState = {
        serverTime: '2026-08-21T19:30:00+02:00',
        workshop,
        participant: {
            id: 'participant-id',
            fullname: 'Jana Nováková',
            email: 'jana@example.com',
            connectedAt: '2026-08-21T19:20:00+02:00',
            isInteractionBanned: false,
            isTrusted: true,
            isModerator: false,
        },
        watchingParticipantCount: 3,
        contentBlocks: [],
        nextContentUnlockAt: null,
        feedback: null,
        comments: [],
        recentReactions: [],
        reactionCounts: [],
    };

    participantMocks.controller = {
        state,
        commentSort: 'recent',
        isCheckingConnection: false,
        isConnectionRequired: false,
        isRefreshing: false,
        errorMessage: null,
        subscribeToReactions: () => () => undefined,
        newlyUnlockedContentBlockIds: new Set<string>(),
        connect: async () => true,
        changeFullname: async () => true,
        refresh: async () => true,
        changeCommentSort: () => undefined,
        submitComment: async () => true,
        upvoteComment: async () => undefined,
        moderateComment: async () => true,
        moderateAuthor: async () => true,
        react: async () => undefined,
        recordMaterialLinkClick: () => undefined,
        saveFeedback: async () => true,
    };

    // Note: A member returning to a permanent room opens it without any parameters at all, so the room is rendered
    //       without them here and every identity it shows can only have come from the loaded room itself.
    return render(
        <OnlineWorkshopParticipantPage
            workshopSlug={workshop.slug}
            connectionDetails={{
                title: workshop.title,
                description: workshop.description,
                dateLabel: 'Kdykoli online',
                durationLabel: 'Stálý přístup',
            }}
            calendarDetails={null}
            initialEmail=""
            initialFullname=""
            workshopNavigation={workshopNavigation}
        />,
    );
}

afterEach(cleanup);

describe('online workshop participant room', () => {
    it('gathers a workshop occurrence around its stage, its reactions, and its watching count', () => {
        const { container } = renderParticipantRoom(WORKSHOP);

        expect(container.querySelector('iframe')).not.toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).not.toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).not.toBeNull();
    });

    it('leaves a permanent room without the stage, the reactions, and the watching count of a live occurrence', () => {
        const { container } = renderParticipantRoom(COMMUNITY);

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.queryByRole('button', { name: /Reagovat/ })).toBeNull();
        expect(screen.queryByText('Sledují 3 lidé')).toBeNull();
    });

    it('leads from a permanent room to a workshop with the identity the room already verified', () => {
        renderParticipantRoom(COMMUNITY, WORKSHOP_NAVIGATION);

        expect(screen.getByRole('link', { name: new RegExp(WORKSHOP.title) }).getAttribute('href')).toBe(
            `/cs/online-workshop/participant?workshop=${WORKSHOP.slug}&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1`,
        );
    });

    it('keeps the chat and the materials of the shared room in a permanent room', () => {
        renderParticipantRoom(COMMUNITY);

        expect(screen.queryByText(COMMUNITY.title)).not.toBeNull();
        expect(screen.queryByRole('textbox')).not.toBeNull();
    });
});
