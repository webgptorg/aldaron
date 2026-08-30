'use client';

import { COMMUNITY_MEMBERSHIP_SECTION_ID } from '@/businesses/community/config';
import { useCommunityMembershipRoom } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { isPaidCommunityMembershipStatus } from '@/lib/community-membership/communityMembershipTypes';
import { ArrowUpRight, Crown, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.14] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071820]';

const PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-amber-300/25 bg-amber-300/[0.1] px-3 py-1.5 text-amber-100';

/**
 * Says which membership the connected member has, and leads a free member to the offer in the very same room.
 *
 * Note: Nothing is claimed while the membership is unknown, and nothing is offered where it cannot be bought, so a
 *       server without a payment gate simply shows no badge instead of promising a purchase it cannot finish.
 */
export function CommunityMembershipBadge() {
    const membershipRoom = useCommunityMembershipRoom();
    const ensureMembershipLoaded = membershipRoom?.ensureMembershipLoaded;

    useEffect(() => {
        ensureMembershipLoaded?.();
    }, [ensureMembershipLoaded]);

    const membership = membershipRoom?.membership ?? null;
    if (membership === null) {
        return null;
    }

    if (isPaidCommunityMembershipStatus(membership.status)) {
        return (
            <span
                className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${PAID_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME}`}
                title="Máte placené členství komunity"
            >
                <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Placené členství</span>
            </span>
        );
    }

    if (!membership.isPurchaseOffered) {
        return null;
    }

    return (
        <a
            href={`#${COMMUNITY_MEMBERSHIP_SECTION_ID}`}
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME}`}
            aria-label="Free členství. Přejít na placené členství"
            title="Free členství – přejít na placené členství"
        >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Free členství</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
    );
}
