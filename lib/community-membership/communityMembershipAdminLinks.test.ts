import {
    createCommunityMembershipAdminPath,
    readCommunityMembershipAdminMemberEmail,
} from '@/lib/community-membership/communityMembershipAdminLinks';
import { describe, expect, it } from 'vitest';

describe('community membership administration links', () => {
    it('uses the durable normalized e-mail to open a membership from its community participant', () => {
        expect(createCommunityMembershipAdminPath('memberships', ' Jana@Example.COM ')).toBe(
            '/admin/community?tab=memberships&member=jana%40example.com',
        );
    });

    it('opens the participant side without inventing a member target when one was not selected', () => {
        expect(createCommunityMembershipAdminPath('participants')).toBe('/admin/community?tab=participants');
    });

    it('normalizes and bounds the member identity read from a shareable admin link', () => {
        expect(readCommunityMembershipAdminMemberEmail(new URLSearchParams('member=Jana%40Example.COM'))).toBe(
            'jana@example.com',
        );
        expect(readCommunityMembershipAdminMemberEmail(new URLSearchParams())).toBeNull();
    });
});
