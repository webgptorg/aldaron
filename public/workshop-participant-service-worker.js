/*
 * The participant room deliberately owns this worker rather than turning the whole site into a PWA. It keeps an
 * application shell and one canonical document per workshop, while the React room keeps its authenticated data in
 * local browser storage. This lets a previously opened room come back during a temporary application-server outage.
 */

const WORKSHOP_PARTICIPANT_PATH = '/cs/online-workshop/participant';
const WORKSHOP_PARTICIPANT_CACHE_NAME = 'promptbook-workshop-participant-v1';

function isWorkshopParticipantPage(url) {
    return url.origin === self.location.origin && url.pathname === WORKSHOP_PARTICIPANT_PATH;
}

function getCanonicalWorkshopParticipantRequest(url) {
    if (!isWorkshopParticipantPage(url)) {
        return null;
    }

    const workshopSlug = url.searchParams.get('workshop');
    if (!workshopSlug) {
        // A legacy address without a selected workshop must stay online: choosing an arbitrary cached term would be
        // worse than showing that the service is temporarily unavailable.
        return null;
    }

    const canonicalUrl = new URL(WORKSHOP_PARTICIPANT_PATH, self.location.origin);
    canonicalUrl.searchParams.set('workshop', workshopSlug);
    return new Request(canonicalUrl.toString());
}

function isCanonicalWorkshopParticipantRequest(request, canonicalRequest) {
    return request.url === canonicalRequest.url;
}

function isWorkshopApplicationAsset(url) {
    return (
        url.origin === self.location.origin &&
        (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/logo/'))
    );
}

async function cacheWorkshopApplicationAsset(request) {
    const cache = await caches.open(WORKSHOP_PARTICIPANT_CACHE_NAME);
    const cachedResponse = await cache.match(request, { ignoreVary: true });
    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await fetch(request);
    if (response.ok) {
        await cache.put(request, response.clone());
    }
    return response;
}

async function cacheWorkshopApplicationAssets(urls) {
    await Promise.all(
        urls.map(async (url) => {
            try {
                const request = new Request(url, { credentials: 'same-origin' });
                if (isWorkshopApplicationAsset(new URL(request.url))) {
                    await cacheWorkshopApplicationAsset(request);
                }
            } catch {
                // One stale build asset must not stop the rest of the already loaded application from being cached.
            }
        }),
    );
}

async function respondWithWorkshopParticipantPage(request) {
    const requestUrl = new URL(request.url);
    const canonicalRequest = getCanonicalWorkshopParticipantRequest(requestUrl);
    const cache = await caches.open(WORKSHOP_PARTICIPANT_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);
        if (
            networkResponse.ok &&
            canonicalRequest !== null &&
            isCanonicalWorkshopParticipantRequest(request, canonicalRequest)
        ) {
            await cache.put(canonicalRequest, networkResponse.clone());
        }

        if (networkResponse.status !== 429 && networkResponse.status < 500) {
            return networkResponse;
        }

        const cachedResponse =
            canonicalRequest === null ? null : await cache.match(canonicalRequest, { ignoreVary: true });
        return cachedResponse ?? networkResponse;
    } catch {
        const cachedResponse =
            canonicalRequest === null ? null : await cache.match(canonicalRequest, { ignoreVary: true });
        if (cachedResponse) {
            return cachedResponse;
        }

        throw new Error('Workshop participant page is unavailable and has not been cached yet.');
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    const message = event.data;
    if (
        !message ||
        message.type !== 'cache-workshop-participant-assets' ||
        !Array.isArray(message.urls) ||
        !message.urls.every((url) => typeof url === 'string')
    ) {
        return;
    }

    event.waitUntil(cacheWorkshopApplicationAssets(message.urls));
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (event.request.mode === 'navigate' && isWorkshopParticipantPage(requestUrl)) {
        event.respondWith(respondWithWorkshopParticipantPage(event.request));
        return;
    }

    if (isWorkshopApplicationAsset(requestUrl)) {
        event.respondWith(cacheWorkshopApplicationAsset(event.request));
    }
});
