import { CommunityParticipantPage } from '@/businesses/community/CommunityParticipantPage';
import { COMMUNITY_METADATA } from '@/businesses/community/communityMetadata';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { loadPublishedCommunity, loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import { loadCommunityProjects } from '@/lib/communityProjects';
import { notFound } from 'next/navigation';

type CommunityRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
    }>;
};

export const metadata = COMMUNITY_METADATA;
export const dynamic = 'force-dynamic';

/**
 * Czech-only community entry point. It deliberately reads the same `email` and `fullname` parameters as workshop
 * rooms, so invitation links can prefill one shared waiting-room form.
 */
export default async function CzechCommunityRoute({ searchParams }: CommunityRouteProps) {
    const resolvedSearchParams = await searchParams;
    const [community, workshops, projects] = await Promise.all([
        loadPublishedCommunity(),
        loadPublishedWorkshopSummaries(),
        loadCommunityProjects(6),
    ]);
    if (community === null) {
        notFound();
    }

    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );

    return (
        <CommunityParticipantPage
            community={community}
            workshops={workshops}
            projects={projects}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
        />
    );
}
