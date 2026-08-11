import { WORKSHOP_SETTINGS_TABLE_NAME } from '@/lib/workshop/workshopConfig';
import { assertQuerySucceeded, getWorkshopDatabase } from '@/lib/workshop/workshopDatabase';
import type { WorkshopSettings, WorkshopSettingsChanges } from '@/lib/workshop/workshopTypes';

/**
 * Settings of the workshop, falling back to the given ones while the administration has not saved any yet
 *
 * Note: The fallback is what the landing page promises, so the countdown is right even before anybody opens the
 *       administration.
 */
export async function fetchWorkshopSettings(
    workshopId: string,
    fallbackSettings: WorkshopSettings,
): Promise<WorkshopSettings> {
    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_SETTINGS_TABLE_NAME)
        .select('*')
        .eq('workshopId', workshopId)
        .maybeSingle();

    assertQuerySucceeded(error);

    if (data === null) {
        return { ...fallbackSettings, workshopId };
    }

    return data as WorkshopSettings;
}

/**
 * Save the changed settings, creating the row of the workshop when it is saved for the first time
 */
export async function saveWorkshopSettings(
    workshopId: string,
    settingsChanges: WorkshopSettingsChanges,
    fallbackSettings: WorkshopSettings,
): Promise<WorkshopSettings> {
    const currentSettings = await fetchWorkshopSettings(workshopId, fallbackSettings);

    const { data, error } = await getWorkshopDatabase()
        .from(WORKSHOP_SETTINGS_TABLE_NAME)
        .upsert({ ...currentSettings, ...settingsChanges, workshopId }, { onConflict: 'workshopId' })
        .select()
        .single();

    assertQuerySucceeded(error);

    return data as WorkshopSettings;
}
