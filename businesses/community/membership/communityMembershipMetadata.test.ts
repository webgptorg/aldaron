import { describe, expect, it } from 'vitest';
import { COMMUNITY_MEMBERSHIP_METADATA, COMMUNITY_MEMBERSHIP_PAGE_DEFINITION } from './communityMembershipMetadata';

describe('community membership metadata', () => {
    it('keeps personalized query values out of every navigation referrer', () => {
        expect(COMMUNITY_MEMBERSHIP_METADATA.referrer).toBe('origin');
    });

    it('registers the public Czech membership route', () => {
        expect(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION).toMatchObject({
            path: '/cs/komunita/clenstvi',
            language: 'cs',
        });
    });
});
