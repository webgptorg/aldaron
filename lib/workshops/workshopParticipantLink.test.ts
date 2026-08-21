import {
    createWorkshopParticipantLink,
    createWorkshopSelectionPath,
    readWorkshopSlug,
} from '@/lib/workshops/workshopParticipantLink';
import { describe, expect, it } from 'vitest';

const WORKSHOP_SLUG = 'production-ai-2026-09-10';

describe('workshop selection URLs', () => {
    it('keeps the selected occurrence in a participant link together with the prefilled identity', () => {
        expect(
            createWorkshopParticipantLink(
                '/cs/online-workshop/participant',
                { email: 'jana@example.com', fullname: 'Jana Nováková' },
                WORKSHOP_SLUG,
            ),
        ).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('keeps the selected occurrence even without a prefilled participant identity', () => {
        expect(createWorkshopSelectionPath('/cs/online-workshop/participant', WORKSHOP_SLUG)).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10',
        );
        expect(
            createWorkshopParticipantLink(
                '/cs/online-workshop/participant',
                { email: '', fullname: 'Jana Nováková' },
                WORKSHOP_SLUG,
            ),
        ).toBeNull();
    });

    it('treats a missing or blank selection as the legacy default but leaves a selected slug intact', () => {
        expect(readWorkshopSlug(undefined)).toBeNull();
        expect(readWorkshopSlug('   ')).toBeNull();
        expect(readWorkshopSlug(['production-ai-2026-09-10', 'other-workshop'])).toBe(WORKSHOP_SLUG);
    });
});
