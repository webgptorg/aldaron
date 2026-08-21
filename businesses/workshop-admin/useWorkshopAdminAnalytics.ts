'use client';

import { fetchAdminWorkshopAnalytics } from '@/businesses/workshop-admin/workshopAdminApiClient';
import type { WorkshopAdminAnalytics } from '@/lib/workshops/workshopTypes';
import { useEffect, useState } from 'react';

type UseWorkshopAdminAnalyticsOptions = {
    readonly adminToken: string;
    readonly workshopId: string;
    readonly refreshVersion: number;
};

type WorkshopAdminAnalyticsState = {
    readonly analytics: WorkshopAdminAnalytics | null;
    readonly errorMessage: string | null;
    readonly isLoading: boolean;
};

/**
 * Keeps the independently refreshable analytics request consistent wherever workshop activity is presented.
 */
export function useWorkshopAdminAnalytics({
    adminToken,
    workshopId,
    refreshVersion,
}: UseWorkshopAdminAnalyticsOptions): WorkshopAdminAnalyticsState {
    const [analytics, setAnalytics] = useState<WorkshopAdminAnalytics | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isRequestCurrent = true;
        setIsLoading(true);

        void fetchAdminWorkshopAnalytics(adminToken, workshopId)
            .then((loadedAnalytics) => {
                if (!isRequestCurrent) {
                    return;
                }

                setAnalytics(loadedAnalytics);
                setErrorMessage(null);
            })
            .catch((error: Error) => {
                if (isRequestCurrent) {
                    setErrorMessage(error.message);
                }
            })
            .finally(() => {
                if (isRequestCurrent) {
                    setIsLoading(false);
                }
            });

        return () => {
            isRequestCurrent = false;
        };
    }, [adminToken, refreshVersion, workshopId]);

    return { analytics, errorMessage, isLoading };
}
