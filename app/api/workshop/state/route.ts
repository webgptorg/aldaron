import { loadWorkshopState } from '@/lib/workshop/loadWorkshopState';
import { getFallbackWorkshopSettings, readWorkshopIdFromRequest } from '@/lib/workshop/servedWorkshop';
import { createWorkshopApiErrorResponse } from '@/lib/workshop/workshopApiErrorResponse';
import { NextResponse } from 'next/server';

/**
 * Note: The answer is different a second later, it must never be cached
 */
export const dynamic = 'force-dynamic';

/**
 * Everything one participant may see at this very moment
 *
 * Note: It is open to anybody who knows the address of the workshop, exactly like the stream itself. The content
 *       which is not unlocked yet is filtered out here, on the server, so it cannot be read early.
 */
export async function GET(request: Request) {
    try {
        const workshopId = readWorkshopIdFromRequest(request);
        const workshopState = await loadWorkshopState(workshopId, getFallbackWorkshopSettings(workshopId));

        return NextResponse.json(workshopState);
    } catch (error) {
        return createWorkshopApiErrorResponse(error);
    }
}
