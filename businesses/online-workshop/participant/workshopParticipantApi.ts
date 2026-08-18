import type {
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopPublicState,
    WorkshopReaction,
} from '@/lib/workshops/workshopTypes';

export class WorkshopApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'WorkshopApiError';
    }
}

async function readResponseJson<ResponseBody>(response: Response): Promise<ResponseBody> {
    const body = (await response.json().catch(() => ({}))) as { readonly error?: unknown } & ResponseBody;
    if (!response.ok) {
        throw new WorkshopApiError(
            typeof body.error === 'string' ? body.error : 'Požadavek se nepovedl.',
            response.status,
        );
    }
    return body;
}

function getWorkshopApiUrl(workshopSlug: string, path: string): string {
    return `/api/workshops/${encodeURIComponent(workshopSlug)}/${path}`;
}

export async function connectToWorkshop(
    workshopSlug: string,
    values: { readonly fullname: string; readonly email: string },
): Promise<{ readonly state: WorkshopPublicState | null }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'connect'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    return readResponseJson(response);
}

export async function fetchWorkshopState(
    workshopSlug: string,
    commentSort: WorkshopCommentSort,
): Promise<WorkshopPublicState> {
    const searchParameters = new URLSearchParams({ sort: commentSort });
    const response = await fetch(`${getWorkshopApiUrl(workshopSlug, 'state')}?${searchParameters}`, {
        credentials: 'same-origin',
        cache: 'no-store',
    });
    return readResponseJson(response);
}

export async function submitWorkshopComment(
    workshopSlug: string,
    body: string,
): Promise<{ readonly comment: WorkshopComment }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'comments'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
    });
    return readResponseJson(response);
}

export async function upvoteWorkshopComment(
    workshopSlug: string,
    commentId: string,
): Promise<{ readonly commentId: string; readonly upvoteCount: number; readonly isUpvotedByParticipant: boolean }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, `comments/${encodeURIComponent(commentId)}/upvotes`), {
        method: 'POST',
        credentials: 'same-origin',
    });
    return readResponseJson(response);
}

export async function sendWorkshopReaction(
    workshopSlug: string,
    emoji: string,
): Promise<{ readonly reaction: WorkshopReaction }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'reactions'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
    });
    return readResponseJson(response);
}

export async function recordWorkshopMaterialLinkClick(workshopSlug: string, contentId: string): Promise<void> {
    const response = await fetch(
        getWorkshopApiUrl(workshopSlug, `content/${encodeURIComponent(contentId)}/link-clicks`),
        {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: true,
        },
    );
    if (!response.ok) {
        await readResponseJson(response);
    }
}

export async function reportWorkshopPresence(workshopSlug: string, activeDurationSeconds: number): Promise<void> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'presence'), {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeDurationSeconds }),
    });
    if (!response.ok) {
        await readResponseJson(response);
    }
}
