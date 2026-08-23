'use client';

import { useEffect } from 'react';

type ScrollToRegistrationSectionProps = {
    readonly isScrollRequested: boolean;
    readonly registrationSectionId: string;
};

/**
 * A `?code=` link pre-fills a form and brings that form into view even when it has no hash.
 */
export function ScrollToRegistrationSection({
    isScrollRequested,
    registrationSectionId,
}: ScrollToRegistrationSectionProps) {
    useEffect(() => {
        if (!isScrollRequested) {
            return;
        }

        const scrollAnimationFrame = window.requestAnimationFrame(() => {
            document
                .getElementById(registrationSectionId)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        return () => window.cancelAnimationFrame(scrollAnimationFrame);
    }, [isScrollRequested, registrationSectionId]);

    return null;
}
