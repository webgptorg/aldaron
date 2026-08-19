import type {
    WorkshopComment,
    WorkshopCommentSort,
    WorkshopParticipant,
    WorkshopPublicState,
    WorkshopReaction,
} from '@/lib/workshops/workshopTypes';

/**
 * What the room sends when a participant writes into the chat
 *
 * Note: A `parentCommentId` turns the message into a reply below that very comment.
 */
export type WorkshopCommentValues = {
    readonly body: string;
    readonly parentCommentId: string | null;
};

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

export async function changeWorkshopParticipantFullname(
    workshopSlug: string,
    fullname: string,
): Promise<{ readonly participant: WorkshopParticipant }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'participant'), {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname }),
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
    values: WorkshopCommentValues,
): Promise<{ readonly comment: WorkshopComment }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'comments'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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

export async function reportWorkshopPresence(
    workshopSlug: string,
    activeDurationSeconds: number,
): Promise<{ readonly watchingParticipantCount: number }> {
    const response = await fetch(getWorkshopApiUrl(workshopSlug, 'presence'), {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeDurationSeconds }),
    });
    return readResponseJson(response);
}
