'use client';

import { fetchAdminWorkshopAnalytics } from '@/businesses/workshop-admin/workshopAdminApiClient';
import type { WorkshopAdminAnalytics } from '@/lib/workshops/workshopTypes';
import { useEffect, useState } from 'react';

type UseWorkshopAdminAnalyticsOptions = {
    readonly workshopId: string;
    readonly refreshVersion: number;
};

type WorkshopAdminAnalyticsState = {
    readonly analytics: WorkshopAdminAnalytics | null;
    readonly errorMessage: string | null;

    /**
     * Whether there is nothing to show yet, which is the only moment anything may be shown instead of the data
     */
    readonly isInitialLoading: boolean;

    /**
     * Whether newer data is on its way while the previous one is still on the screen
     */
    readonly isRefreshing: boolean;
};

/**
 * What was loaded, together with the room it was loaded for, so that the answer about one workshop is never read under
 * the name of another one
 */
type LoadedWorkshopAdminAnalytics = {
    readonly workshopId: string;
    readonly analytics: WorkshopAdminAnalytics | null;
    readonly errorMessage: string | null;
};

/**
 * Keeps the independently refreshable analytics request consistent wherever workshop activity is presented.
 *
 * Note: A refresh never takes the previous answer off the screen. The administration reloads itself every few seconds,
 *       so emptying the state first would replace the whole section by a spinner just as often, which is what made the
 *       page blink. Only a change of the room really has nothing to show.
 */
export function useWorkshopAdminAnalytics({
    workshopId,
    refreshVersion,
}: UseWorkshopAdminAnalyticsOptions): WorkshopAdminAnalyticsState {
    const [loadedAnalytics, setLoadedAnalytics] = useState<LoadedWorkshopAdminAnalytics | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(true);

    useEffect(() => {
        let isRequestCurrent = true;
        setIsRefreshing(true);

        void fetchAdminWorkshopAnalytics(workshopId)
            .then((analytics) => {
                if (isRequestCurrent) {
                    setLoadedAnalytics({ workshopId, analytics, errorMessage: null });
                }
            })
            .catch((error: Error) => {
                if (isRequestCurrent) {
                    setLoadedAnalytics((currentlyLoaded) => ({
                        workshopId,
                        analytics: currentlyLoaded?.workshopId === workshopId ? currentlyLoaded.analytics : null,
                        errorMessage: error.message,
                    }));
                }
            })
            .finally(() => {
                if (isRequestCurrent) {
                    setIsRefreshing(false);
                }
            });

        return () => {
            isRequestCurrent = false;
        };
    }, [refreshVersion, workshopId]);

    const currentlyLoaded = loadedAnalytics?.workshopId === workshopId ? loadedAnalytics : null;

    return {
        analytics: currentlyLoaded?.analytics ?? null,
        errorMessage: currentlyLoaded?.errorMessage ?? null,
        isInitialLoading: currentlyLoaded === null,
        isRefreshing,
    };
}
