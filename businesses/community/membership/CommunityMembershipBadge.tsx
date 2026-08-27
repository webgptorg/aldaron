import { COMMUNITY_MEMBERSHIP_PATH } from '@/businesses/community/membership/communityMembershipConfig';
import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME =
    'border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/[0.14] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071820]';

/**
 * Links a free community member to the one membership offer and its paid-member benefits.
 *
 * The participant session has no commercial entitlement yet, so the permanent community currently presents its
 * universally available free tier instead of guessing whether a payment request has already been activated.
 */
export function CommunityMembershipBadge() {
    return (
        <Link
            href={COMMUNITY_MEMBERSHIP_PATH}
            className={`${WORKSHOP_ROOM_BADGE_CLASS_NAME} ${FREE_COMMUNITY_MEMBERSHIP_BADGE_CLASS_NAME}`}
            aria-label="Free členství. Zjistit výhody placeného členství"
            title="Free členství – zjistit výhody placeného členství"
        >
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Free členství</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </Link>
    );
}
