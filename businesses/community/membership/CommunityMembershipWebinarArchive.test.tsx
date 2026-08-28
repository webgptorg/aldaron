/**
 * @vitest-environment jsdom
 */

import { EMPTY_COMMUNITY_PREVIEW, type CommunityPreview } from '@/lib/community/communityPreviewTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CommunityMembershipWebinarArchive } from './CommunityMembershipWebinarArchive';

const REAL_COMMUNITY_PREVIEW: CommunityPreview = {
    ...EMPTY_COMMUNITY_PREVIEW,
    totals: { ...EMPTY_COMMUNITY_PREVIEW.totals, heldWebinarCount: 2 },
    upcomingWebinars: [
        { id: 'git-a-ai', title: 'Git a AI', startsAt: '2026-09-07T11:00:00.000Z' },
        { id: 'ai-a-databaze', title: 'AI a databáze', startsAt: '2026-09-11T08:00:00.000Z' },
    ],
};

describe('community membership webinar archive', () => {
    afterEach(() => {
        cleanup();
    });

    it('names the webinars which are really published instead of imagined topics', () => {
        render(<CommunityMembershipWebinarArchive preview={REAL_COMMUNITY_PREVIEW} />);

        expect(screen.getByText('Nejbližší živé webináře')).toBeTruthy();
        expect(screen.getByText('Git a AI')).toBeTruthy();
        expect(screen.getByText('7. 9.')).toBeTruthy();
        expect(screen.getByText('AI a databáze')).toBeTruthy();
        expect(screen.getByText('11. 9.')).toBeTruthy();
    });

    it('says how many webinars the archive already holds', () => {
        render(<CommunityMembershipWebinarArchive preview={REAL_COMMUNITY_PREVIEW} />);

        expect(screen.getByText(/2 odvysílané webináře/)).toBeTruthy();
    });

    it('describes the archive by its topics while no term can be read', () => {
        render(<CommunityMembershipWebinarArchive preview={EMPTY_COMMUNITY_PREVIEW} />);

        expect(screen.getByText('V archivu najdete třeba')).toBeTruthy();
        expect(screen.getByText('Práce s kontextem')).toBeTruthy();
        expect(screen.queryByText(/odvysílan/)).toBeNull();
    });
});
