import { CommunityParticipantPage } from '@/businesses/community/CommunityParticipantPage';
import { loadCommunityProjects } from '@/lib/communityProjects';
import { findWorkshopBySlug, getWorkshopDatabaseOrNull, mapWorkshopRow } from '@/lib/workshops/workshopDatabase';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';
import { loadPublishedCommunity, loadPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CommunityProjectPage({ params, searchParams }: { params: Promise<{ projectId: string }>; searchParams: Promise<{ email?: string; fullname?: string }> }) {
    const { projectId } = await params; const project = (await loadCommunityProjects()).find((item) => item.id === projectId); const database = getWorkshopDatabaseOrNull();
    if (!project || !database) notFound();
    const discussionRow = await findWorkshopBySlug(database, project.discussionSlug, true); const community = await loadPublishedCommunity();
    if (!discussionRow || !community) notFound();
    const query = await searchParams; const identity = readWorkshopParticipantIdentity(query.email, query.fullname);
    return <CommunityParticipantPage community={mapWorkshopRow(discussionRow)} workshops={await loadPublishedWorkshopSummaries()} projects={await loadCommunityProjects(6)} initialEmail={identity.email} initialFullname={identity.fullname} />;
}
