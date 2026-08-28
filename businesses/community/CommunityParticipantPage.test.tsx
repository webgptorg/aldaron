/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/membership/communityMembershipConfig';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/businesses/community/projects/CommunityProjectsSection', () => ({
    CommunityProjectsSection: () => null,
}));

vi.mock('@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage', () => ({
    OnlineWorkshopParticipantPage: ({
        participantHeaderSupplement,
    }: {
        readonly participantHeaderSupplement?: ReactNode;
    }) => <main>{participantHeaderSupplement}</main>,
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

describe('community participant page', () => {
    it('adds the free-membership badge to the shared participant header', () => {
        render(<CommunityParticipantPage community={COMMUNITY} workshops={[]} initialEmail="" initialFullname="" />);

        expect(
            screen.getByRole('link', { name: 'Free členství. Zjistit výhody placeného členství' }).getAttribute('href'),
        ).toBe(COMMUNITY_MEMBERSHIP_PATH);
    });
});
