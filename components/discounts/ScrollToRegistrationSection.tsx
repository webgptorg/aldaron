'use client';

import { useEffect } from 'react';

type ScrollToRegistrationSectionProps = {
    readonly isScrollRequested: boolean;
    readonly registrationSectionId: string;
};

/**
 * A link which carries `?code=` prefills the registration form of a place, and whoever follows it
 * should be looking at that very form. A browser scrolls to a `#fragment` by itself, but the code
 * alone would leave the visitor at the top of the page, so every place asks for the scroll here
 * instead of writing its own.
 *
 * Note: The scroll waits for the next frame, because the sections of a landing page mount with
 *       their entrance animations and the form is not where it will be until they have.
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
