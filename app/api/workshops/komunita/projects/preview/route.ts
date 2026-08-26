import { getCrossSiteResponseOrNull } from '@/lib/api/getCrossSiteResponseOrNull';
import { readJsonObjectOrNull } from '@/lib/api/readJsonObjectOrNull';
import {
    isAuthenticatedCommunityProjectRequest,
    getAuthenticatedCommunityProjectRequest,
} from '@/lib/community-projects/communityProjectRequest';
import { scrapeCommunityProjectPreview } from '@/lib/community-projects/communityProjectPreview';
import { communityProjectPreviewSchema } from '@/lib/community-projects/communityProjectSchemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * The first wizard step is intentionally this small: a member sends only the project URL, and the server reads the
 * public metadata that fills the editable second step.
 */
export async function POST(request: NextRequest) {
    const crossSiteResponse = getCrossSiteResponseOrNull(request);
    if (crossSiteResponse) {
        return crossSiteResponse;
    }

    const authenticatedRequest = await getAuthenticatedCommunityProjectRequest(request);
    if (!isAuthenticatedCommunityProjectRequest(authenticatedRequest)) {
        return authenticatedRequest;
    }

    const body = await readJsonObjectOrNull(request);
    const parsedResult = communityProjectPreviewSchema.safeParse(body);
    if (!parsedResult.success) {
        return NextResponse.json({ error: 'Zadejte platnou veřejnou URL projektu.' }, { status: 400 });
    }

    try {
        const preview = await scrapeCommunityProjectPreview(parsedResult.data.url);
        return NextResponse.json({ preview }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json(
            { error: 'Náhled se nepodařilo načíst. Zkontrolujte, že je stránka veřejně dostupná.' },
            { status: 422 },
        );
    }
}
