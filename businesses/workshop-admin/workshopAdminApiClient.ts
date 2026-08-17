import type {
    WorkshopAdminSnapshot,
    WorkshopCommentStatus,
    WorkshopContentBlock,
    WorkshopDetails,
    WorkshopSummary,
} from '@/lib/workshops/workshopTypes';
import { buildAdminUrl } from '@/lib/admin/buildAdminApiUrl';

export type WorkshopWriteValues = {
    readonly title: string;
    readonly description: string;
    readonly startsAt: string;
    readonly endsAt: string | null;
    readonly youtubeVideoId: string | null;
    readonly isPublished: boolean;
    readonly allowedReactions: readonly string[];
};

export type WorkshopCreateValues = WorkshopWriteValues & {
    readonly slug: string;
};

export type WorkshopContentWriteValues = {
    readonly title: string;
    readonly bodyMarkdown: string;
    readonly unlockAt: string;
    readonly sortOrder: number;
    readonly isPublished: boolean;
};

function createAdminApiUrl(path: string, adminToken: string): string {
    return buildAdminUrl(`/api/admin/workshops${path}`, adminToken);
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

export async function fetchAdminWorkshopList(adminToken: string): Promise<readonly WorkshopSummary[]> {
    const result = await requestAdminJson<{ readonly workshops: readonly WorkshopSummary[] }>(
        createAdminApiUrl('', adminToken),
    );
    return result.workshops;
}

export async function fetchAdminWorkshopSnapshot(
    adminToken: string,
    workshopId: string,
): Promise<WorkshopAdminSnapshot> {
    return requestAdminJson(createAdminApiUrl(`/${encodeURIComponent(workshopId)}`, adminToken));
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

export async function moderateAdminWorkshopComment(
    adminToken: string,
    workshopId: string,
    commentId: string,
    status: Exclude<WorkshopCommentStatus, 'pending'>,
): Promise<void> {
    await requestAdminJson(
        createAdminApiUrl(`/${encodeURIComponent(workshopId)}/comments/${encodeURIComponent(commentId)}`, adminToken),
        createJsonMutation('PATCH', { status }),
    );
}
