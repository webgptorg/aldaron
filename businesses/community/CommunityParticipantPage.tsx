import {
    CZECH_COMMUNITY_ROOM_COPY,
    CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
    createCzechCommunityConnectionDetails,
} from '@/businesses/community/communityContent';
import { CommunityProjectsPanel } from '@/businesses/community/projects/CommunityProjectsPanel';
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
 * audited workshop infrastructure rather than a parallel implementation, while the `community` kind of the room takes
 * away what only a live occurrence has: its stage, its schedule, and its live updates. What only the community has,
 * the projects of its members, is handed to the room as one additional panel.
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
            materialsTitle={CZECH_COMMUNITY_ROOM_COPY.materialsTitle}
            unavailableConnectionMessage={CZECH_COMMUNITY_ROOM_COPY.unavailableConnectionMessage}
            renderAdditionalPanels={(participant) => (
                <CommunityProjectsPanel memberFullname={participant.fullname} />
            )}
            workshopNavigation={{
                workshops,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
                ...CZECH_COMMUNITY_WORKSHOP_NAVIGATION_COPY,
            }}
        />
    );
}
