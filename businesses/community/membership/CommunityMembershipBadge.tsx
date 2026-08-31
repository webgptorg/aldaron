'use client';

import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { formatCzechWorkshopDay } from '@/lib/workshops/workshopDate';
import { ArrowUpRight, CalendarClock, Crown, Sparkles } from 'lucide-react';

const FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.14] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071820]';

const PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-amber-300/25 bg-amber-300/[0.1] px-3 py-1.5 text-amber-100 transition hover:border-amber-200/45 hover:bg-amber-300/[0.15] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071820]';

const CANCELLATION_SCHEDULED_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-rose-300/25 bg-rose-300/[0.1] px-3 py-1.5 text-rose-100 transition hover:border-rose-200/45 hover:bg-rose-300/[0.15] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071820]';

function createCancellationScheduledMembershipLabel(currentPeriodEndsAt: string | null): string {
    return currentPeriodEndsAt === null
        ? 'Placené členství končí'
        : `Placené členství končí ${formatCzechWorkshopDay(currentPeriodEndsAt)}`;
}

/**
 * Says which membership the connected member has and opens its details in the very same room.
 *
 * Note: Nothing is claimed while the membership is unknown, and nothing is offered where it cannot be bought, so a
 *       server without a payment gate simply shows no badge instead of promising a purchase it cannot finish.
 */
export function CommunityMembershipBadge() {
    const membershipRoom = useCommunityMembershipRoom();
    const membership = membershipRoom?.membership ?? null;
    if (membership === null) {
        return null;
    }

    if (isPaidCommunityMembershipStatus(membership.status)) {
        const membershipLabel = membership.isCancellationScheduled
            ? createCancellationScheduledMembershipLabel(membership.currentPeriodEndsAt)
            : 'Placené členství';

        return (
            <button
                type="button"
                onClick={membershipRoom?.openMembershipModal}
                className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${
                    membership.isCancellationScheduled
                        ? CANCELLATION_SCHEDULED_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME
                        : PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME
                }`}
                aria-label={`${membershipLabel}. Otevřít stav členství`}
                title={`${membershipLabel} – otevřít stav členství`}
            >
                {membership.isCancellationScheduled ? (
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                    <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>{membershipLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </button>
        );
    }

    if (!membership.isPurchaseOffered) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={membershipRoom?.openMembershipModal}
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME}`}
            aria-label="Free členství. Otevřít možnosti členství"
            title="Free členství – otevřít možnosti členství"
        >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Free členství</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </button>
    );
}
