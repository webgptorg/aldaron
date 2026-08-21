import {
    findMostRecentPublishedWorkshop,
    findUpcomingPublishedWorkshops,
    findWorkshopBySlug,
    getWorkshopDatabaseOrNull,
    mapWorkshopRow,
    mapWorkshopSummaryRow,
} from '@/lib/workshops/workshopDatabase';
import type { WorkshopDetails, WorkshopSummary } from '@/lib/workshops/workshopTypes';

/**
 * Loads every term which visitors can still register for. A missing workshop database deliberately looks like no
 * listed terms instead of exposing internal configuration details on the public landing page.
 */
export async function loadUpcomingPublishedWorkshopSummaries(): Promise<readonly WorkshopSummary[]> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return [];
    }

    const workshopRows = await findUpcomingPublishedWorkshops(supabase);
    return workshopRows.map(mapWorkshopSummaryRow);
}

/**
 * Resolves a published occurrence selected by the URL. Legacy links without a selection deliberately enter the most
 * recent published occurrence, while an explicitly unknown slug never silently opens a different workshop.
 */
export async function loadSelectedPublishedWorkshop(
    requestedWorkshopSlug: string | null,
): Promise<WorkshopDetails | null> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return null;
    }

    const workshopRow =
        requestedWorkshopSlug === null
            ? await findMostRecentPublishedWorkshop(supabase)
            : await findWorkshopBySlug(supabase, requestedWorkshopSlug, true);

    return workshopRow === null ? null : mapWorkshopRow(workshopRow);
}
