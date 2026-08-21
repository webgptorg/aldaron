import {
    createWorkshopRegistrationThankYouPath,
    isWorkshopRegistrationWithinDirectParticipantLinkWindow,
} from '@/lib/workshops/workshopRegistrationTiming';
import { describe, expect, it } from 'vitest';

const WORKSHOP_START_AT = '2026-08-20T19:00:00+02:00';
const WORKSHOP_START_AT_MILLISECONDS = Date.parse(WORKSHOP_START_AT);
const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const WORKSHOP_SLUG = 'online-workshop-2026-08-20';

describe('workshop direct participant links', () => {
    it('offers the direct link strictly inside the final 24 hours before the workshop', () => {
        expect(
            isWorkshopRegistrationWithinDirectParticipantLinkWindow(
                WORKSHOP_START_AT,
                WORKSHOP_START_AT_MILLISECONDS - 23 * ONE_HOUR_IN_MILLISECONDS,
            ),
        ).toBe(true);
        expect(
            isWorkshopRegistrationWithinDirectParticipantLinkWindow(
                WORKSHOP_START_AT,
                WORKSHOP_START_AT_MILLISECONDS - 24 * ONE_HOUR_IN_MILLISECONDS,
            ),
        ).toBe(false);
    });

    it('does not offer a link after the workshop starts or for an invalid workshop date', () => {
        expect(
            isWorkshopRegistrationWithinDirectParticipantLinkWindow(
                WORKSHOP_START_AT,
                WORKSHOP_START_AT_MILLISECONDS + ONE_HOUR_IN_MILLISECONDS,
            ),
        ).toBe(false);
        expect(isWorkshopRegistrationWithinDirectParticipantLinkWindow('not-a-date', Date.now())).toBe(false);
    });

    it('carries valid participant details to the thank-you path only inside the direct-link window', () => {
        const participantIdentity = { email: 'jana@example.com', fullname: 'Jana Nováková' } as const;

        expect(
            createWorkshopRegistrationThankYouPath({
                thankYouPath: '/cs/online-workshop/dekujeme',
                workshopSlug: WORKSHOP_SLUG,
                startsAt: WORKSHOP_START_AT,
                participantIdentity,
                registrationAtMilliseconds: WORKSHOP_START_AT_MILLISECONDS - ONE_HOUR_IN_MILLISECONDS,
            }),
        ).toBe(
            '/cs/online-workshop/dekujeme?workshop=online-workshop-2026-08-20&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
        expect(
            createWorkshopRegistrationThankYouPath({
                thankYouPath: '/cs/online-workshop/dekujeme',
                workshopSlug: WORKSHOP_SLUG,
                startsAt: WORKSHOP_START_AT,
                participantIdentity,
                registrationAtMilliseconds: WORKSHOP_START_AT_MILLISECONDS - 25 * ONE_HOUR_IN_MILLISECONDS,
            }),
        ).toBe('/cs/online-workshop/dekujeme?workshop=online-workshop-2026-08-20');
    });
});
