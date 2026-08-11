import { getUnauthorizedResponseOrNull } from '@/lib/admin/adminApiGuard';
import { getFallbackWorkshopSettings, readWorkshopIdFromRequest } from '@/lib/workshop/servedWorkshop';
import { createWorkshopApiErrorResponse } from '@/lib/workshop/workshopApiErrorResponse';
import { readSettingsChanges } from '@/lib/workshop/workshopRequestBodies';
import { fetchWorkshopSettings, saveWorkshopSettings } from '@/lib/workshop/workshopSettingsRepository';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Settings the workshop currently runs on
 *
 * Note: The participants get the very same settings inside `/api/workshop/state`, this endpoint exists so that the
 *       administration can edit them without pulling the whole chat with them.
 */
export async function GET(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const workshopId = readWorkshopIdFromRequest(request);
        const settings = await fetchWorkshopSettings(workshopId, getFallbackWorkshopSettings(workshopId));

        return NextResponse.json({ settings });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}

/**
 * Change the settings, which is how the start of the countdown, the stream and the chat are steered
 */
export async function PATCH(request: Request) {
    const unauthorizedResponse = getUnauthorizedResponseOrNull(request);
    if (unauthorizedResponse) {
        return unauthorizedResponse;
    }

    try {
        const workshopId = readWorkshopIdFromRequest(request);
        const body = (await request.json()) as Record<string, unknown>;

        const settings = await saveWorkshopSettings(
            workshopId,
            readSettingsChanges(body),
            getFallbackWorkshopSettings(workshopId),
        );

        return NextResponse.json({ settings });
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}
