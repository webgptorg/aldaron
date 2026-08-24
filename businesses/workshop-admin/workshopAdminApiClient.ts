import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type {
    WorkshopAdminAnalytics,
    WorkshopAdminFeedback,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopKind,
    WorkshopProjectStatus,
} from '@/lib/workshops/workshopTypes';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import {
    serializeWorkshopAdminParticipantQuery,
    type WorkshopAdminParticipantQuery,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import type { WorkshopAdminExportKind } from '@/lib/workshops/workshopAdminExports';

/**
 * The settings of a room as its administration writes them
 *
 * Note: A setting which the kind of the room does not have is left out instead of being sent as an empty value, so a
 *       calm room never receives a schedule, a stage, or reactions it could not offer anyway, and the only room of its
 *       kind never receives the address it was given once and for all.
 */
export type WorkshopWriteValues = {
    readonly title: string;
    readonly description: string;
    readonly isPublished: boolean;
    readonly disabledPanels: readonly WorkshopPanelKey[];
    readonly slug?: string;
    readonly startsAt?: string;
    readonly endsAt?: string | null;
    readonly youtubeVideoId?: string | null;
    readonly allowedReactions?: readonly string[];
};

/**
 * A new room always starts as an occurrence in time at an address of its own, so its creation says both.
 */
export type WorkshopCreateValues = WorkshopWriteValues & {
    readonly slug: string;
    readonly startsAt: string;
};

export type WorkshopContentWriteValues = {
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;
    readonly isFollowUp: boolean;
};

export type WorkshopPollCreateValues = {
    readonly question: string;
    readonly options: readonly string[];
};

export type WorkshopArtificialCommentValues = {
    readonly authorName: string;
    readonly body: string;
};

export type WorkshopArtificialReactionValues = {
    readonly emoji: string;
};

function createAdminApiUrl(
    path: string,
    additionalParameters: Readonly<Record<string, string | undefined>> = {},
): string {
    return appendSearchParameters(`/api/admin/workshops${path}`, additionalParameters);
}

/**
 * Note: The session of the administration is a cookie, so every request carries it on its own
 */
async function requestAdminJson<ResponseBody>(url: string, requestOptions?: RequestInit): Promise<ResponseBody> {
    const response = await fetch(url, { ...requestOptions, cache: 'no-store' });
    const body = (await response.json().catch(() => ({}))) as ResponseBody & { readonly error?: unknown };
    if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'Admin request failed');
    }
    return body;
}

function createJsonMutation(method: 'POST' | 'PATCH', body: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export async function fetchAdminWorkshopList(
    workshopKind: WorkshopKind = 'workshop',
): Promise<readonly WorkshopAdminSummary[]> {
    const result = await requestAdminJson<{ readonly workshops: readonly WorkshopAdminSummary[] }>(
        createAdminApiUrl('', { kind: workshopKind }),
    );
    return result.workshops;
}

export async function fetchAdminWorkshopSnapshot(
    workshopId: string,
    commentStatus: WorkshopCommentStatus = 'pending',
    isCommentsIncluded = true,
    isProjectsIncluded = true,
): Promise<WorkshopAdminSnapshot> {
    return requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`, {
            commentStatus,
            includeComments: String(isCommentsIncluded),
            includeProjects: String(isProjectsIncluded),
        }),
    );
}

export async function fetchAdminWorkshopParticipantPage(
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<WorkshopAdminParticipantPage> {
    const queryParameters = Object.fromEntries(serializeWorkshopAdminParticipantQuery(query).entries());
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants`, queryParameters));
}

export async function fetchAdminWorkshopParticipantTimeline(
    workshopId: string,
    participantId: string,
): Promise<WorkshopAdminParticipantTimeline> {
    return requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}/timeline`,
        ),
    );
}

export async function fetchAdminWorkshopAnalytics(workshopId: string): Promise<WorkshopAdminAnalytics> {
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/analytics`));
}

export async function fetchAdminWorkshopFeedback(workshopId: string): Promise<readonly WorkshopAdminFeedback[]> {
    const result = await requestAdminJson<{ readonly feedbacks: readonly WorkshopAdminFeedback[] }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/feedback`),
    );
    return result.feedbacks;
}

/**
 * Builds a download URL for one workshop administration section.
 */
export function buildAdminWorkshopExportUrl(
    workshopId: string,
    exportKind: WorkshopAdminExportKind,
    participantQuery?: WorkshopAdminParticipantQuery,
): string {
    const exportParameters =
        participantQuery === undefined
            ? {}
            : Object.fromEntries(serializeWorkshopAdminParticipantQuery(participantQuery).entries());

    delete exportParameters.page;
    delete exportParameters.pageSize;

    return createAdminApiUrl(
        `/${encodeURIComponent(workshopId)}/exports/${encodeURIComponent(exportKind)}`,
        exportParameters,
    );
}

export async function createAdminWorkshop(values: WorkshopCreateValues): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl(''),
        createJsonMutation('POST', values),
    );
    return result.workshop;
}

export async function updateAdminWorkshop(workshopId: string, values: WorkshopWriteValues): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.workshop;
}

export async function createAdminWorkshopContent(
    workshopId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content`),
        createJsonMutation('POST', values),
    );
    return result.contentBlock;
}

export async function updateAdminWorkshopContent(
    workshopId: string,
    contentId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`),
        createJsonMutation('PATCH', values),
    );
    return result.contentBlock;
}

export async function deleteAdminWorkshopContent(workshopId: string, contentId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`),
        { method: 'DELETE' },
    );
}

export async function createAdminWorkshopPoll(workshopId: string, values: WorkshopPollCreateValues): Promise<string> {
    const result = await requestAdminJson<{ readonly pollId: string }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls`),
        createJsonMutation('POST', values),
    );
    return result.pollId;
}

/**
 * Ends a poll permanently while keeping its anonymous results visible to the community.
 */
export async function closeAdminWorkshopPoll(workshopId: string, pollId: string): Promise<string> {
    const result = await requestAdminJson<{ readonly pollId: string }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/polls/${encodeURIComponent(pollId)}`),
        createJsonMutation('PATCH', { isClosed: true }),
    );
    return result.pollId;
}

/**
 * Publishes or rejects a member project from the community moderation queue.
 */
export async function updateAdminWorkshopProjectStatus(
    workshopId: string,
    projectId: string,
    status: Exclude<WorkshopProjectStatus, 'pending'>,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/projects/${encodeURIComponent(projectId)}`),
        createJsonMutation('PATCH', { status }),
    );
}

export async function deleteAdminWorkshopProject(workshopId: string, projectId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/projects/${encodeURIComponent(projectId)}`),
        { method: 'DELETE' },
    );
}

export async function deleteAdminWorkshopComment(workshopId: string, commentId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`),
        { method: 'DELETE' },
    );
}

async function updateAdminWorkshopComment(
    workshopId: string,
    commentId: string,
    values: {
        readonly status?: Exclude<WorkshopCommentStatus, 'pending'>;
        readonly body?: string;
        readonly isPinned?: boolean;
    },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`),
        createJsonMutation('PATCH', values),
    );
}

export async function moderateAdminWorkshopComment(
    workshopId: string,
    commentId: string,
    status: Exclude<WorkshopCommentStatus, 'pending'>,
): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { status });
}

/**
 * Corrects the text of a message which is already in the chat, for example to fix a typo or add information
 */
export async function editAdminWorkshopCommentBody(workshopId: string, commentId: string, body: string): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { body });
}

/**
 * Holds one message on top of the chat for the whole room, or releases the top again
 *
 * Note: A pinned message is approved together with pinning it, so the room really sees what is held on its top.
 */
export async function pinAdminWorkshopComment(workshopId: string, commentId: string, isPinned: boolean): Promise<void> {
    await updateAdminWorkshopComment(workshopId, commentId, { isPinned });
}

export async function createAdminWorkshopArtificialComment(
    workshopId: string,
    values: WorkshopArtificialCommentValues,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments`),
        createJsonMutation('POST', values),
    );
}

export async function adjustAdminWorkshopCommentArtificialUpvotes(
    workshopId: string,
    commentId: string,
    artificialUpvoteAdjustment: number,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}/artificial-upvotes`,
        ),
        createJsonMutation('POST', { artificialUpvoteAdjustment }),
    );
}

export async function sendAdminWorkshopArtificialReaction(
    workshopId: string,
    values: WorkshopArtificialReactionValues,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/artificial-reactions`),
        createJsonMutation('POST', values),
    );
}

export async function clearAdminWorkshopReactions(workshopId: string): Promise<void> {
    await requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/reactions`), {
        method: 'DELETE',
    });
}

async function updateAdminWorkshopParticipant(
    workshopId: string,
    participantId: string,
    values: {
        readonly isInteractionBanned?: boolean;
        readonly isTrusted?: boolean;
        readonly isModerator?: boolean;
    },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`),
        createJsonMutation('PATCH', values),
    );
}

export async function updateAdminWorkshopParticipantInteractionBan(
    workshopId: string,
    participantId: string,
    isInteractionBanned: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isInteractionBanned });
}

export async function updateAdminWorkshopParticipantTrusted(
    workshopId: string,
    participantId: string,
    isTrusted: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isTrusted });
}

/**
 * Appoints one participant as a moderator of the room, or dismisses them again
 *
 * Note: Only the administration does this. A moderator of the room can trust and ban, but never hand their own
 *       moderation on.
 */
export async function updateAdminWorkshopParticipantModerator(
    workshopId: string,
    participantId: string,
    isModerator: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(workshopId, participantId, { isModerator });
}

export async function deleteAdminWorkshopParticipant(workshopId: string, participantId: string): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`),
        { method: 'DELETE' },
    );
}
