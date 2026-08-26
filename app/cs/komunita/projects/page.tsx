import { CommunityProjectsListingPage } from '@/businesses/community/projects/CommunityProjectsListingPage';
import { createPageMetadata } from '@/lib/metadata/create-page-metadata';

export const metadata = createPageMetadata({
    path: '/cs/komunita/projects',
    language: 'cs',
    title: 'Projekty komunity Promptbooku',
    socialTitle: 'Projekty komunity Promptbooku',
    description: 'Projekty a tvorba členů komunity Promptbooku.',
    socialDescription: 'Objevujte a podpořte projekty členů komunity Promptbooku.',
    socialPreviewImageAlt: 'Projekty komunity Promptbooku',
    isSocialPreviewImageGenerated: false,
    isIndexed: false,
});

export const dynamic = 'force-dynamic';

export default function CommunityProjectsRoute() {
    return <CommunityProjectsListingPage />;
}
