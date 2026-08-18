type GoogleAnalyticsEventParameter = string | number | boolean | undefined;
type GoogleAnalyticsEventParameters = Readonly<Record<string, GoogleAnalyticsEventParameter>>;
type GoogleAnalyticsFunction = (
    command: 'event',
    eventName: string,
    eventParameters?: GoogleAnalyticsEventParameters,
) => void;

type PendingGoogleAnalyticsEvent = {
    readonly eventName: string;
    readonly eventParameters: GoogleAnalyticsEventParameters;
};

const GOOGLE_ANALYTICS_POLL_INTERVAL_MILLISECONDS = 100;
const GOOGLE_ANALYTICS_MAXIMUM_WAIT_MILLISECONDS = 5_000;
let pendingGoogleAnalyticsEvents: readonly PendingGoogleAnalyticsEvent[] = [];
let isGoogleAnalyticsPollScheduled = false;

declare global {
    interface Window {
        gtag?: GoogleAnalyticsFunction;
    }
}

/**
 * Reports an anonymized interaction only after Google Analytics has loaded.
 * Callers must never pass names, e-mail addresses, URLs, or other personal
 * data in event parameters.
 */
export function trackGoogleAnalyticsEvent(
    eventName: string,
    eventParameters: GoogleAnalyticsEventParameters = {},
): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.gtag) {
        window.gtag('event', eventName, eventParameters);
        return;
    }

    pendingGoogleAnalyticsEvents = [...pendingGoogleAnalyticsEvents, { eventName, eventParameters }];
    scheduleGoogleAnalyticsEventFlush();
}

function scheduleGoogleAnalyticsEventFlush(): void {
    if (isGoogleAnalyticsPollScheduled || typeof window === 'undefined') {
        return;
    }

    isGoogleAnalyticsPollScheduled = true;
    const pollingStartedAtMilliseconds = Date.now();
    const intervalId = window.setInterval(() => {
        if (window.gtag) {
            window.clearInterval(intervalId);
            pendingGoogleAnalyticsEvents.forEach((pendingEvent) =>
                window.gtag?.('event', pendingEvent.eventName, pendingEvent.eventParameters),
            );
            pendingGoogleAnalyticsEvents = [];
            isGoogleAnalyticsPollScheduled = false;
            return;
        }

        if (Date.now() - pollingStartedAtMilliseconds >= GOOGLE_ANALYTICS_MAXIMUM_WAIT_MILLISECONDS) {
            window.clearInterval(intervalId);
            pendingGoogleAnalyticsEvents = [];
            isGoogleAnalyticsPollScheduled = false;
        }
    }, GOOGLE_ANALYTICS_POLL_INTERVAL_MILLISECONDS);
}
