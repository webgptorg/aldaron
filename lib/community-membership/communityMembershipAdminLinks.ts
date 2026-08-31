import { COMMUNITY_ADMIN_PATH } from '@/businesses/community/config';
import { normalizeCommunityMemberEmail } from '@/lib/community-membership/communityMembershipTypes';

export const COMMUNITY_MEMBERSHIP_ADMIN_MEMBER_PARAMETER_NAME = 'member';

export type CommunityMembershipAdminTab = 'participants' | 'memberships';

/**
 * Builds the two-way handoff between a community participant and their durable membership. A participant is a room
 * session, while a membership belongs to an address, so the address is the one stable target carried by the link.
 */
export function createCommunityMembershipAdminPath(
    tab: CommunityMembershipAdminTab,
    memberEmail?: string,
): string {
    const searchParameters = new URLSearchParams({ tab });
    const normalizedMemberEmail = memberEmail === undefined ? '' : normalizeCommunityMemberEmail(memberEmail);

    if (normalizedMemberEmail !== '') {
        searchParameters.set(COMMUNITY_MEMBERSHIP_ADMIN_MEMBER_PARAMETER_NAME, normalizedMemberEmail);
    }

    return `${COMMUNITY_ADMIN_PATH}?${searchParameters}`;
}

/**
 * Reads the optional cross-link target. It is intentionally bounded before it reaches an admin list filter, so a
 * manually edited link cannot turn a filter request into an unnecessarily large value.
 */
export function readCommunityMembershipAdminMemberEmail(searchParams: URLSearchParams): string | null {
    const memberEmail = searchParams.get(COMMUNITY_MEMBERSHIP_ADMIN_MEMBER_PARAMETER_NAME)?.trim().slice(0, 320) ?? '';
    return memberEmail === '' ? null : normalizeCommunityMemberEmail(memberEmail);
}
