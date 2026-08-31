import {
    COMMUNITY_MEMBERSHIP_STATUS_LABELS,
    getCommunityMembershipStatusClassName,
} from '@/businesses/community/membership/communityMembershipStatusPresentation';
import { cn } from '@/lib/utils';
import type { CommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';

type CommunityMembershipStatusBadgeProps = {
    readonly status: CommunityMembershipStatus;
    readonly className?: string;
};

/**
 * The one readable description of a membership lifecycle state, shared by the participant projection and the payment
 * administration so the two views can never disagree about what a status means.
 */
export function CommunityMembershipStatusBadge({ status, className }: CommunityMembershipStatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-2 py-1 text-xs font-semibold whitespace-nowrap',
                getCommunityMembershipStatusClassName(status),
                className,
            )}
        >
            {COMMUNITY_MEMBERSHIP_STATUS_LABELS[status]}
        </span>
    );
}
