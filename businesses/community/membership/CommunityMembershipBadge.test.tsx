/**
 * @vitest-environment jsdom
 */

import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/membership/communityMembershipConfig';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CommunityMembershipBadge } from './CommunityMembershipBadge';

describe('community membership badge', () => {
    it('identifies the free tier and opens the canonical paid-membership offer', () => {
        render(<CommunityMembershipBadge />);

        expect(
            screen.getByRole('link', { name: 'Free členství. Zjistit výhody placeného členství' }).getAttribute('href'),
        ).toBe(COMMUNITY_MEMBERSHIP_PATH);
    });
});
