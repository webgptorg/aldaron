/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/businesses/ai-supervize-mini/workshopRegistrationApi', () => ({
    AiSupervizeMiniWorkshopRegistrationError: class AiSupervizeMiniWorkshopRegistrationError extends Error {},
    submitAiSupervizeMiniWorkshopRegistration: vi.fn(),
}));

vi.mock('@/lib/discounts/discountCodeApi', () => ({
    validateDiscountCode: vi.fn().mockResolvedValue(null),
}));

import { AiSupervizeMiniRegistrationForm } from './AiSupervizeMiniRegistrationForm';

describe('AI Supervize Mini registration form', () => {
    afterEach(() => {
        cleanup();
    });

    it('prefills the discount input from the code passed by the route', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                initialDiscountCode="webinar-2026-08-20"
                initialActiveDiscountByPlaceId={{
                    'ai-supervize-mini-onsite': null,
                    'ai-supervize-mini-online': null,
                }}
                initialWorkshopAvailabilities={[
                    { workshopDateId: '2026-09-04', registeredParticipantCount: 0, remainingSeatCount: 10 },
                    { workshopDateId: '2026-09-09', registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect((screen.getByLabelText('Slevový kód') as HTMLInputElement).value).toBe('webinar-2026-08-20');
    });

    it('shows the remaining uses for a prefilled limited code', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                initialDiscountCode="WEBINAR_2026_08_20"
                initialActiveDiscountByPlaceId={{
                    'ai-supervize-mini-onsite': {
                        code: 'WEBINAR_2026_08_20',
                        percent: 25,
                        remainingUseCount: 3,
                    },
                    'ai-supervize-mini-online': null,
                }}
                initialWorkshopAvailabilities={[
                    { workshopDateId: '2026-09-04', registeredParticipantCount: 0, remainingSeatCount: 10 },
                    { workshopDateId: '2026-09-09', registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect(screen.getByText('Aktivní sleva 25 %. Zbývající počet použití: 3.')).toBeTruthy();
    });
});
