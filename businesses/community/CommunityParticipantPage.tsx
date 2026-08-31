import {
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { CommunityMembershipBadge } from '@/businesses/community/membership/CommunityMembershipBadge';
import { CommunityMembershipModal } from '@/businesses/community/membership/CommunityMembershipModal';
import { CommunityMembershipRoomProvider } from '@/businesses/community/membership/CommunityMembershipRoomProvider';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { WorkshopDetails, WorkshopSummary } from '@/lib/workshops/workshopTypes';

type CommunityParticipantPageProps = {
    readonly community: WorkshopDetails;
    readonly workshops: readonly WorkshopSummary[];
    readonly initialEmail: string;
    readonly initialFullname: string;
};

/**
 * Community-specific data and Czech copy on top of the shared participant room. The room itself remains the same
 * audited workshop infrastructure rather than a parallel implementation, while the `community` kind of the room takes
 * away what only a live occurrence has: its stage, its schedule, and its live updates.
 *
 * Note: The badge in its header and the membership modal are two views of the very same membership, so both are given
 *       it by one provider around the whole room.
 */
export function CommunityParticipantPage({
    community,
    workshops,
    initialEmail,
    initialFullname,
}: CommunityParticipantPageProps) {
    return (
        <CommunityMembershipRoomProvider>
            <OnlineWorkshopParticipantPage
                workshopSlug={community.slug}
                connectionDetails={createCzechCommunityConnectionDetails(community)}
                calendarDetails={null}
                initialEmail={initialEmail}
                initialFullname={initialFullname}
                roomSubtitle={CZECH_COMMUNITY_ROOM_COPY.roomSubtitle}
                isWorkshopSelectionInUrl={false}
                materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
                unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
                participantHeaderSupplement={
                    <>
                        <CommunityMembershipBadge />
                        <CommunityMembershipModal />
                    </>
                }
                workshopNavigation={{
                    workshops,
                    ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
                }}
                mainContentAfterWorkshopNavigation={
                    <CommunityProjectsSection isLimited />
                }
            />
        </CommunityMembershipRoomProvider>
    );
}
