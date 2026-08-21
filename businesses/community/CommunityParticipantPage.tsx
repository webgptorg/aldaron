import {
    CZECH_COMMUNITY_EMPTY_STAGE,
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
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
 * audited, live workshop infrastructure rather than a parallel implementation.
 */
export function CommunityParticipantPage({
    community,
    workshops,
    initialEmail,
    initialFullname,
}: CommunityParticipantPageProps) {
    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={community.slug}
            connectionDetails={createCzechCommunityConnectionDetails(community)}
            calendarDetails={null}
            initialEmail={initialEmail}
            initialFullname={initialFullname}
            roomSubtitle={CZECH_COMMUNITY_ROOM_COPY.roomSubtitle}
            isWorkshopSelectionInUrl={false}
            emptyStage={CZECH_COMMUNITY_EMPTY_STAGE}
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            workshopNavigation={{
                workshops,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
                ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
            }}
        />
    );
}
