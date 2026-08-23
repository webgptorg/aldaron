import { AI_SUPERVIZE_MINI_WORKSHOP_CONFIG } from '@/businesses/ai-supervize-mini/config';
import { describe, expect, it } from 'vitest';
import {
    createAiSupervizeMiniStoredWorkshopRegistration,
    createAiSupervizeMiniWorkshopAvailability,
    createAiSupervizeMiniWorkshopPrice,
    createAiSupervizeMiniWorkshopRegistrationContactNote,
} from './workshopRegistration';

const ONSITE_WORKSHOP_DATE = AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates[0]!;
const ONLINE_WORKSHOP_DATE = AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates[1]!;

function createRegistrationContactNote(selectedDateId: string, participantCount: number): string {
    const workshopDate = AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates.find(
        (candidateWorkshopDate) => candidateWorkshopDate.id === selectedDateId,
    );

    if (workshopDate === undefined) {
        throw new Error('A test registration needs a configured workshop date.');
    }

    return createAiSupervizeMiniWorkshopRegistrationContactNote(
        createAiSupervizeMiniStoredWorkshopRegistration(
            {
                selectedDateId,
                participantCount,
                fullname: 'Jana Nováková',
                email: 'jana@example.com',
                company: 'Firma s.r.o.',
                invoiceType: 'company',
                billingDetails: 'Firma s.r.o., IČO 12345678',
                userNote: '',
                discountCode: '',
            },
            workshopDate,
            null,
        ),
    );
}

describe('AI Supervize Mini workshop availability', () => {
    it('counts participant totals from actual registration contacts instead of a configured countdown', () => {
        const legacyRegistrationContactNote = [
            'AI Supervize Mini registration',
            'Workshop date: 9. 9. 2026',
            '',
            JSON.stringify({
                workshop: 'AI Supervize Mini',
                selectedDateId: ONLINE_WORKSHOP_DATE.id,
                participantCount: 4,
            }),
        ].join('\n');
        const workshopAvailabilities = createAiSupervizeMiniWorkshopAvailability([
            createRegistrationContactNote(ONSITE_WORKSHOP_DATE.id, 3),
            legacyRegistrationContactNote,
            JSON.stringify({ workshop: 'AI Supervize Mini', leadType: 'Interested, but cannot attend' }),
            '{not a registration}',
        ]);

        expect(workshopAvailabilities).toEqual([
            {
                workshopDateId: ONSITE_WORKSHOP_DATE.id,
                registeredParticipantCount: 3,
                remainingSeatCount: 7,
            },
            {
                workshopDateId: ONLINE_WORKSHOP_DATE.id,
                registeredParticipantCount: 4,
                remainingSeatCount: 46,
            },
        ]);
    });

    it('never shows a negative number of remaining seats when existing contacts exceed capacity', () => {
        const workshopAvailabilities = createAiSupervizeMiniWorkshopAvailability([
            createRegistrationContactNote(ONSITE_WORKSHOP_DATE.id, 12),
        ]);

        expect(workshopAvailabilities[0]).toMatchObject({ registeredParticipantCount: 12, remainingSeatCount: 0 });
    });

    it('calculates the 25 percent webinar price for both formats', () => {
        const webinarDiscount = { code: 'WEBINAR_2026_08_20', percent: 25, remainingUseCount: null };

        expect(createAiSupervizeMiniWorkshopPrice(ONSITE_WORKSHOP_DATE, 1, webinarDiscount)).toEqual({
            basePriceCzk: 12000,
            discountAmountCzk: 3000,
            finalPriceCzk: 9000,
        });
        expect(createAiSupervizeMiniWorkshopPrice(ONLINE_WORKSHOP_DATE, 1, webinarDiscount)).toEqual({
            basePriceCzk: 3000,
            discountAmountCzk: 750,
            finalPriceCzk: 2250,
        });
    });
});
