import {
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import type { WorkshopDetails, WorkshopSummary } from '@/lib/workshops/workshopTypes';
import type { CommunityProject } from '@/lib/communityProjects';

type CommunityParticipantPageProps = {
    readonly community: WorkshopDetails;
    readonly workshops: readonly WorkshopSummary[];
    readonly initialEmail: string;
    readonly initialFullname: string;
    readonly projects: readonly CommunityProject[];
};

/**
 * Community-specific data and Czech copy on top of the shared participant room. The room itself remains the same
 * audited workshop infrastructure rather than a parallel implementation, while the `community` kind of the room takes
 * away what only a live occurrence has: its stage, its schedule, and its live updates.
 */
export function CommunityParticipantPage({
    community,
    workshops,
    initialEmail,
    initialFullname,
    projects,
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
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            communityProjects={projects}
            workshopNavigation={{
                workshops,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
                ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
            }}
        />
    );
}
