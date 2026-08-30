import { COMMUNITY_PROJECTS_API_PATH } from '@/businesses/community/config';
import type {
    CommunityProject,
    CommunityProjectModerationStatus,
    CommunityProjectPreview,
    CommunityProjectVote,
} from '@/lib/community-projects/communityProjectTypes';

export class CommunityProjectApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
    }
}

async function readCommunityProjectResponse<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as { readonly error?: unknown } & ResponseBody;
    if (!response.ok) {
        throw new CommunityProjectApiError(
            typeof body.error === 'string' ? body.error : 'Požadavek se nepodařilo dokončit.',
            response.status,
        );
    }

    return body;
}

function getCommunityProjectApiUrl(path: string = ''): string {
    return `${COMMUNITY_PROJECTS_API_PATH}${path}`;
}

export async function fetchCommunityProjects(limit: number | null): Promise<{
    readonly projects: readonly CommunityProject[];
    readonly isModerationOffered: boolean;
}> {
    const searchParameters = limit === null ? '' : `?${new URLSearchParams({ limit: String(limit) })}`;
    const response = await fetch(`${getCommunityProjectApiUrl()}${searchParameters}`, {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readCommunityProjectResponse<{
        readonly projects: readonly CommunityProject[];
        readonly isModerationOffered: boolean;
    }>(response);
}

export async function previewCommunityProject(url: string): Promise<CommunityProjectPreview> {
    const response = await fetch(getCommunityProjectApiUrl('/preview'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });
    const body = await readCommunityProjectResponse<{ readonly preview: CommunityProjectPreview }>(response);
    return body.preview;
}

export async function saveCommunityProject(values: {
    readonly url: string;
    readonly title: string;
    readonly description: string;
}): Promise<CommunityProject> {
    const response = await fetch(getCommunityProjectApiUrl(), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    const body = await readCommunityProjectResponse<{ readonly project: CommunityProject }>(response);
    return body.project;
}

/**
 * A community moderator decides about a project through the same authenticated community session which revealed the
 * pending card.
 */
export async function moderateCommunityProject(
    projectId: string,
    status: CommunityProjectModerationStatus,
): Promise<void> {
    const response = await fetch(getCommunityProjectApiUrl(`/${encodeURIComponent(projectId)}`), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    await readCommunityProjectResponse(response);
}

export async function voteOnCommunityProject(
    projectId: string,
    vote: CommunityProjectVote,
): Promise<{
    readonly vote: CommunityProjectVote | null;
    readonly upvoteCount: number;
    readonly downvoteCount: number;
}> {
    const response = await fetch(getCommunityProjectApiUrl(`/${encodeURIComponent(projectId)}/vote`), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
    });
    return readCommunityProjectResponse(response);
}

export async function connectToCommunityProjectDiscussion(projectId: string): Promise<{ readonly discussionWorkshopSlug: string }> {
    const response = await fetch(getCommunityProjectApiUrl(`/${encodeURIComponent(projectId)}/connect`), {
        method: 'POST',
        credentials: 'same-origin',
    });
    return readCommunityProjectResponse(response);
}
