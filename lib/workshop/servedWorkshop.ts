import { ONLINE_WORKSHOP_DEFAULT_SETTINGS, ONLINE_WORKSHOP_ID } from '@/businesses/online-workshop/config';
import { WORKSHOP_ID_PARAMETER_NAME } from '@/lib/workshop/workshopConfig';
import type { WorkshopSettings } from '@/lib/workshop/workshopTypes';

/**
 * Which workshop this site serves
 *
 * Note: This is the one place where the general workshop machinery meets a concrete workshop of a concrete business.
 *       A second workshop is added by giving it an id and a fallback here, nothing else has to change.
 */
export function readWorkshopIdFromRequest(request: Request): string {
    const workshopId = new URL(request.url).searchParams.get(WORKSHOP_ID_PARAMETER_NAME);

    return workshopId?.trim() || ONLINE_WORKSHOP_ID;
}

/**
 * Settings a workshop runs on before the administration saves its own
 */
export function getFallbackWorkshopSettings(workshopId: string): WorkshopSettings {
    return { ...ONLINE_WORKSHOP_DEFAULT_SETTINGS, workshopId };
}
