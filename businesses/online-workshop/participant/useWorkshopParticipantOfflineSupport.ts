'use client';

import { useEffect } from 'react';

const WORKSHOP_PARTICIPANT_SERVICE_WORKER_PATH = '/workshop-participant-service-worker.js';
const ONLINE_WORKSHOP_SERVICE_WORKER_SCOPE = '/cs/online-workshop/';

function getLoadedWorkshopApplicationAssetUrls(): readonly string[] {
    if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
        return [];
    }

    return Array.from(
        new Set(
            performance
                .getEntriesByType('resource')
                .map(({ name }) => name)
                .filter((resourceUrl) => {
                    const url = new URL(resourceUrl, window.location.href);
                    return (
                        url.origin === window.location.origin &&
                        (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/logo/'))
                    );
                }),
        ),
    );
}

/**
 * Installs the small, participant-only resilience layer. The worker caches only build assets and canonical workshop
 * pages; workshop data itself stays in the per-workshop browser cache owned by the participant controller.
 */
export function useWorkshopParticipantOfflineSupport(): void {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        let isDisposed = false;

        void (async () => {
            try {
                const registration = await navigator.serviceWorker.register(WORKSHOP_PARTICIPANT_SERVICE_WORKER_PATH, {
                    scope: ONLINE_WORKSHOP_SERVICE_WORKER_SCOPE,
                });
                await navigator.serviceWorker.ready;
                if (isDisposed) {
                    return;
                }

                const worker = registration.active ?? navigator.serviceWorker.controller;
                worker?.postMessage({
                    type: 'cache-workshop-participant-assets',
                    urls: getLoadedWorkshopApplicationAssetUrls(),
                });
            } catch (error) {
                // A service worker is an optional resilience layer: unsupported browsers keep the normal live room.
                console.warn('Workshop offline support could not be installed:', error);
            }
        })();

        return () => {
            isDisposed = true;
        };
    }, []);
}

/**
 * Lets server-rendered funnel pages prepare the participant application cache before somebody follows their room link.
 */
export function WorkshopParticipantOfflineSupport() {
    useWorkshopParticipantOfflineSupport();
    return null;
}
