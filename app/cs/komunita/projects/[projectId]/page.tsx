import { CommunityProjectDiscussionPage } from '@/businesses/community/projects/CommunityProjectDiscussionPage';
import { getWorkshopDatabaseOrNull } from '@/lib/workshops/workshopDatabase';
import { loadCommunityProjectById } from '@/lib/community-projects/communityProjectDatabase';
import { communityProjectIdSchema } from '@/lib/community-projects/communityProjectSchemas';
import { notFound } from 'next/navigation';

type CommunityProjectDiscussionRouteProps = {
    readonly params: Promise<{ readonly projectId: string }>;
};

export const dynamic = 'force-dynamic';

export default async function CommunityProjectDiscussionRoute({ params }: CommunityProjectDiscussionRouteProps) {
    const { projectId } = await params;
    if (!communityProjectIdSchema.safeParse(projectId).success) {
        notFound();
    }

    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        notFound();
    }

    const { project } = await loadCommunityProjectById(supabase, projectId, null);
    if (project === null) {
        notFound();
    }

    return <CommunityProjectDiscussionPage project={project} />;
}
