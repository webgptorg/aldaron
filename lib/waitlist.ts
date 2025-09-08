'use client';

/**
 * Utility functions for handling waitlist functionality
 */

/**
 * Checks if the waitlist should be skipped based on URL parameters
 * @param searchParams - URL search parameters
 * @returns true if waitlist should be skipped, false otherwise
 */
export function shouldSkipWaitlist(searchParams: URLSearchParams | null): boolean {
    if (!searchParams) {
        return false;
    }

    const skipWaitlistParam = searchParams.get('skipWaitlist');
    const expectedToken = process.env.NEXT_PUBLIC_SKIP_WAITLIST_TOKEN;

    return skipWaitlistParam === expectedToken && !!expectedToken;
}

/**
 * Determines if waitlist is currently active
 * This can be configured to enable/disable waitlist globally
 * @returns true if waitlist is active, false otherwise
 */
export function isWaitlistActive(): boolean {
    // For now, waitlist is always active unless skipped
    // This could be made configurable via environment variable if needed
    return true;
}

/**
 * Checks if the current request should show waitlist
 * @param searchParams - URL search parameters
 * @returns true if waitlist should be shown, false if normal flow should proceed
 */
export function shouldShowWaitlist(searchParams: URLSearchParams | null): boolean {
    if (!isWaitlistActive()) {
        return false;
    }

    return !shouldSkipWaitlist(searchParams);
}
