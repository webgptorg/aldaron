/**
 * Signature of the Meta Pixel command queue installed by the snippet in the root layout
 */
type MetaPixelFunction = (command: string, eventName: string) => void;

declare global {
    interface Window {
        fbq?: MetaPixelFunction;
    }
}

/**
 * How often the presence of the Meta Pixel is checked while its snippet is still loading
 */
const META_PIXEL_POLL_INTERVAL_MS = 100;

/**
 * How long the tracking waits for the Meta Pixel before it gives up
 *
 * Note: The pixel is loaded with the `afterInteractive` strategy, so it can easily become available later than the
 *       React effect which wants to report an event.
 */
const META_PIXEL_MAX_WAIT_MS = 5000;

/**
 * Reports one standard Meta Pixel event, waiting for the pixel snippet when it has not run yet
 *
 * @param eventName name of a Meta standard event, for example `CompleteRegistration`
 * @returns function cancelling a report which is still waiting for the pixel
 */
export function trackMetaPixelEvent(eventName: string): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }

    if (window.fbq) {
        window.fbq('track', eventName);
        return () => {};
    }

    const startedAtMs = Date.now();
    const pollHandle = setInterval(() => {
        if (window.fbq) {
            clearInterval(pollHandle);
            window.fbq('track', eventName);
            return;
        }

        if (Date.now() - startedAtMs >= META_PIXEL_MAX_WAIT_MS) {
            clearInterval(pollHandle);
            console.warn(`Meta Pixel is not available, event "${eventName}" was not reported`);
        }
    }, META_PIXEL_POLL_INTERVAL_MS);

    return () => clearInterval(pollHandle);
}
