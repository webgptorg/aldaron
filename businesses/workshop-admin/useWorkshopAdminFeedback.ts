'use client';

import { fetchAdminWorkshopFeedback } from '@/businesses/workshop-admin/workshopAdminApiClient';
import type { WorkshopAdminFeedback } from '@/lib/workshops/workshopTypes';
import { useEffect, useState } from 'react';

type UseWorkshopAdminFeedbackOptions = {
    readonly workshopId: string;
    readonly refreshVersion: number;
};

type WorkshopAdminFeedbackState = {
    readonly feedbacks: readonly WorkshopAdminFeedback[] | null;
    readonly errorMessage: string | null;
    readonly isInitialLoading: boolean;
};

type LoadedWorkshopAdminFeedback = {
    readonly workshopId: string;
    readonly feedbacks: readonly WorkshopAdminFeedback[] | null;
    readonly errorMessage: string | null;
};

/**
 * Keeps the private, free-text feedback list fresh without adding it to every administration snapshot.
 */
export function useWorkshopAdminFeedback({
    workshopId,
    refreshVersion,
}: UseWorkshopAdminFeedbackOptions): WorkshopAdminFeedbackState {
    const [loadedFeedback, setLoadedFeedback] = useState<LoadedWorkshopAdminFeedback | null>(null);

    useEffect(() => {
        let isRequestCurrent = true;

        void fetchAdminWorkshopFeedback(workshopId)
            .then((feedbacks) => {
                if (isRequestCurrent) {
                    setLoadedFeedback({ workshopId, feedbacks, errorMessage: null });
                }
            })
            .catch((error: Error) => {
                if (isRequestCurrent) {
                    setLoadedFeedback((currentlyLoaded) => ({
                        workshopId,
                        feedbacks: currentlyLoaded?.workshopId === workshopId ? currentlyLoaded.feedbacks : null,
                        errorMessage: error.message,
                    }));
                }
            });

        return () => {
            isRequestCurrent = false;
        };
    }, [refreshVersion, workshopId]);

    const currentlyLoaded = loadedFeedback?.workshopId === workshopId ? loadedFeedback : null;
    return {
        feedbacks: currentlyLoaded?.feedbacks ?? null,
        errorMessage: currentlyLoaded?.errorMessage ?? null,
        isInitialLoading: currentlyLoaded === null,
    };
}
