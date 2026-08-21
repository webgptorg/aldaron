import type { WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import type {
    WorkshopAdminAnalytics,
    WorkshopAdminParticipantPage,
    WorkshopAdminParticipantTimeline,
    WorkshopAdminSnapshot,
    WorkshopAdminSummary,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopKind,
} from '@/lib/workshops/workshopTypes';
import { buildAdminUrl } from '@/lib/admin/buildAdminApiUrl';
import {
    serializeWorkshopAdminParticipantQuery,
    type WorkshopAdminParticipantQuery,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import type { WorkshopAdminExportKind } from '@/lib/workshops/workshopAdminExports';

export type WorkshopWriteValues = {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly youtubeVideoId: string | null;
    readonly isPublished: boolean;
    readonly allowedReactions: readonly string[];
    readonly disabledPanels: readonly WorkshopPanelKey[];
};

export type WorkshopCreateValues = WorkshopWriteValues;

export type WorkshopContentWriteValues = {
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;
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
    adminToken: string,
    additionalParameters: Readonly<Record<string, string | undefined>> = {},
): string {
    return buildAdminUrl(`/api/admin/workshops${path}`, adminToken, additionalParameters);
}

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
    adminToken: string,
    workshopKind: WorkshopKind = 'workshop',
): Promise<readonly WorkshopAdminSummary[]> {
    const result = await requestAdminJson<{ readonly workshops: readonly WorkshopAdminSummary[] }>(
        createAdminApiUrl('', adminToken, { kind: workshopKind }),
    );
    return result.workshops;
}

export async function fetchAdminWorkshopSnapshot(
    adminToken: string,
    workshopId: string,
    commentStatus: WorkshopCommentStatus = 'pending',
    isCommentsIncluded = true,
): Promise<WorkshopAdminSnapshot> {
    return requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`, adminToken, {
            commentStatus,
            includeComments: String(isCommentsIncluded),
        }),
    );
}

export async function fetchAdminWorkshopParticipantPage(
    adminToken: string,
    workshopId: string,
    query: WorkshopAdminParticipantQuery,
): Promise<WorkshopAdminParticipantPage> {
    const queryParameters = Object.fromEntries(serializeWorkshopAdminParticipantQuery(query).entries());
    return requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/participants`, adminToken, queryParameters),
    );
}

export async function fetchAdminWorkshopParticipantTimeline(
    adminToken: string,
    workshopId: string,
    participantId: string,
): Promise<WorkshopAdminParticipantTimeline> {
    return requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}/timeline`,
            adminToken,
        ),
    );
}

export async function fetchAdminWorkshopAnalytics(
    adminToken: string,
    workshopId: string,
): Promise<WorkshopAdminAnalytics> {
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/analytics`, adminToken));
}

/**
 * Builds a download URL for one workshop administration section.
 */
export function buildAdminWorkshopExportUrl(
    adminToken: string,
    workshopId: string,
    exportKind: WorkshopAdminExportKind,
    participantQuery?: WorkshopAdminParticipantQuery,
): string {
    const exportParameters = participantQuery === undefined
        ? {}
        : Object.fromEntries(serializeWorkshopAdminParticipantQuery(participantQuery).entries());

    delete exportParameters.page;
    delete exportParameters.pageSize;

    return createAdminApiUrl(
        `/${encodeURIComponent(workshopId)}/exports/${encodeURIComponent(exportKind)}`,
        adminToken,
        exportParameters,
    );
}

export async function createAdminWorkshop(adminToken: string, values: WorkshopCreateValues): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl('', adminToken),
        createJsonMutation('POST', values),
    );
    return result.workshop;
}

export async function updateAdminWorkshop(
    adminToken: string,
    workshopId: string,
    values: WorkshopWriteValues,
): Promise<WorkshopDetails> {
    const result = await requestAdminJson<{ readonly workshop: WorkshopDetails }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}`, adminToken),
        createJsonMutation('PATCH', values),
    );
    return result.workshop;
}

export async function createAdminWorkshopContent(
    adminToken: string,
    workshopId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content`, adminToken),
        createJsonMutation('POST', values),
    );
    return result.contentBlock;
}

export async function updateAdminWorkshopContent(
    adminToken: string,
    workshopId: string,
    contentId: string,
    values: WorkshopContentWriteValues,
): Promise<WorkshopContentBlock> {
    const result = await requestAdminJson<{ readonly contentBlock: WorkshopContentBlock }>(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`, adminToken),
        createJsonMutation('PATCH', values),
    );
    return result.contentBlock;
}

export async function deleteAdminWorkshopContent(
    adminToken: string,
    workshopId: string,
    contentId: string,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/content/${encodeURIComponent(contentId)}`, adminToken),
        { method: 'DELETE' },
    );
}

export async function deleteAdminWorkshopComment(
    adminToken: string,
    workshopId: string,
    commentId: string,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`, adminToken),
        { method: 'DELETE' },
    );
}

async function updateAdminWorkshopComment(
    adminToken: string,
    workshopId: string,
    commentId: string,
    values: {
        readonly status?: Exclude<WorkshopCommentStatus, 'pending'>;
        readonly body?: string;
        readonly isPinned?: boolean;
    },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`, adminToken),
        createJsonMutation('PATCH', values),
    );
}

export async function moderateAdminWorkshopComment(
    adminToken: string,
    workshopId: string,
    commentId: string,
    status: Exclude<WorkshopCommentStatus, 'pending'>,
): Promise<void> {
    await updateAdminWorkshopComment(adminToken, workshopId, commentId, { status });
}

/**
 * Corrects the text of a message which is already in the chat, for example to fix a typo or add information
 */
export async function editAdminWorkshopCommentBody(
    adminToken: string,
    workshopId: string,
    commentId: string,
    body: string,
): Promise<void> {
    await updateAdminWorkshopComment(adminToken, workshopId, commentId, { body });
}

/**
 * Holds one message on top of the chat for the whole room, or releases the top again
 *
 * Note: A pinned message is approved together with pinning it, so the room really sees what is held on its top.
 */
export async function pinAdminWorkshopComment(
    adminToken: string,
    workshopId: string,
    commentId: string,
    isPinned: boolean,
): Promise<void> {
    await updateAdminWorkshopComment(adminToken, workshopId, commentId, { isPinned });
}

export async function createAdminWorkshopArtificialComment(
    adminToken: string,
    workshopId: string,
    values: WorkshopArtificialCommentValues,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments`, adminToken),
        createJsonMutation('POST', values),
    );
}

export async function adjustAdminWorkshopCommentArtificialUpvotes(
    adminToken: string,
    workshopId: string,
    commentId: string,
    artificialUpvoteAdjustment: number,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}/artificial-upvotes`,
            adminToken,
        ),
        createJsonMutation('POST', { artificialUpvoteAdjustment }),
    );
}

export async function sendAdminWorkshopArtificialReaction(
    adminToken: string,
    workshopId: string,
    values: WorkshopArtificialReactionValues,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/artificial-reactions`, adminToken),
        createJsonMutation('POST', values),
    );
}

export async function clearAdminWorkshopReactions(adminToken: string, workshopId: string): Promise<void> {
    await requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}/reactions`, adminToken), {
        method: 'DELETE',
    });
}

async function updateAdminWorkshopParticipant(
    adminToken: string,
    workshopId: string,
    participantId: string,
    values: { readonly isInteractionBanned?: boolean; readonly isTrusted?: boolean },
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`,
            adminToken,
        ),
        createJsonMutation('PATCH', values),
    );
}

export async function updateAdminWorkshopParticipantInteractionBan(
    adminToken: string,
    workshopId: string,
    participantId: string,
    isInteractionBanned: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(adminToken, workshopId, participantId, { isInteractionBanned });
}

export async function updateAdminWorkshopParticipantTrusted(
    adminToken: string,
    workshopId: string,
    participantId: string,
    isTrusted: boolean,
): Promise<void> {
    await updateAdminWorkshopParticipant(adminToken, workshopId, participantId, { isTrusted });
}

export async function deleteAdminWorkshopParticipant(
    adminToken: string,
    workshopId: string,
    participantId: string,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(
            `/${encodeURIComponent(workshopId)}/participants/${encodeURIComponent(participantId)}`,
            adminToken,
        ),
        { method: 'DELETE' },
    );
}
