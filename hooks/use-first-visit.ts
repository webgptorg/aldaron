'use client';

import { useEffect, useState } from 'react';

const FIRST_VISIT_KEY = 'aldaron-first-visit';

/**
 * Hook to track if this is the user's first visit to the site in this session.
 * Returns true on first visit, false on subsequent navigations within the site.
 * Resets when the browser session ends (new tab/window or browser restart).
 */
export function useFirstVisit(): boolean {
    const [isFirstVisit, setIsFirstVisit] = useState(true);

    useEffect(() => {
        // Check if user has visited before in this session
        const hasVisitedBefore = sessionStorage.getItem(FIRST_VISIT_KEY);
        
        if (hasVisitedBefore) {
            setIsFirstVisit(false);
        } else {
            // Mark that user has now visited
            sessionStorage.setItem(FIRST_VISIT_KEY, 'true');
        }
    }, []);

    return isFirstVisit;
}