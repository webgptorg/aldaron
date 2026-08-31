import {
    DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY,
    parseCommunityMembershipAdminQuery,
    serializeCommunityMembershipAdminQuery,
} from '@/lib/community-membership/communityMembershipAdminQuery';
import { describe, expect, it } from 'vitest';

describe('community membership admin query', () => {
    it('reads the payment table filters, sort, and page from its own URL parameters', () => {
        expect(
            parseCommunityMembershipAdminQuery(
                new URLSearchParams({
                    membershipSearch: '  Jana Nováková  ',
                    membershipStatus: 'past-due',
                    membershipTest: 'false',
                    membershipSortBy: 'monthlyPriceCzk',
                    membershipSortDirection: 'ASCENDING',
                    membershipPage: '3',
                    membershipPageSize: '100',
                }),
            ),
        ).toEqual({
            searchQuery: 'Jana Nováková',
            status: 'past-due',
            isTestPayment: false,
            sortBy: 'monthlyPriceCzk',
            sortDirection: 'ASCENDING',
            page: 3,
            pageSize: 100,
        });
    });

    it('falls back to bounded defaults when a hand-written administration link is invalid', () => {
        expect(
            parseCommunityMembershipAdminQuery(
                new URLSearchParams({
                    membershipStatus: 'none',
                    membershipTest: 'perhaps',
                    membershipSortBy: 'DROP TABLE',
                    membershipSortDirection: 'sideways',
                    membershipPage: '0',
                    membershipPageSize: '999999',
                }),
            ),
        ).toEqual(DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY);
    });

    it('keeps the selected dashboard tab and cross-link target while it updates membership controls', () => {
        const searchParameters = serializeCommunityMembershipAdminQuery(
            {
                ...DEFAULT_COMMUNITY_MEMBERSHIP_ADMIN_QUERY,
                searchQuery: 'jana@example.com',
                status: 'active',
                isTestPayment: true,
                page: 2,
            },
            new URLSearchParams('tab=memberships&member=jana%40example.com'),
        );

        expect(searchParameters.toString()).toBe(
            'tab=memberships&member=jana%40example.com&membershipSearch=jana%40example.com&membershipStatus=active&membershipTest=true&membershipPage=2',
        );
    });
});
