/**
 * @vitest-environment jsdom
 */

import {
    AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
    AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
} from '@/lib/discounts/discountPlaces';
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

const WORKSHOP_AVAILABILITIES = [
    { workshopDateId: '2026-09-04', registeredParticipantCount: 0, remainingSeatCount: 10 },
    { workshopDateId: '2026-09-09', registeredParticipantCount: 0, remainingSeatCount: 50 },
];

const NO_ACTIVE_DISCOUNTS = {
    [AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID]: null,
    [AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID]: null,
};

describe('AI Supervize Mini registration form', () => {
    afterEach(() => {
        cleanup();
    });

    it('prefills the discount input from the code passed by the route', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                initialDiscountCode="webinar-2026-08-20"
                initialActiveDiscountByPlaceId={NO_ACTIVE_DISCOUNTS}
                initialWorkshopAvailabilities={WORKSHOP_AVAILABILITIES}
            />,
        );

        expect((screen.getByLabelText('Slevový kód') as HTMLInputElement).value).toBe('webinar-2026-08-20');
    });

    it('says how many uses of a limited code are left', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                initialDiscountCode="WEBINAR_2026_08_20"
                initialActiveDiscountByPlaceId={{
                    ...NO_ACTIVE_DISCOUNTS,
                    [AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID]: {
                        code: 'WEBINAR_2026_08_20',
                        percent: 25,
                        remainingUseCount: 3,
                    },
                }}
                initialWorkshopAvailabilities={WORKSHOP_AVAILABILITIES}
            />,
        );

        expect(screen.getByText('Aktivní sleva 25 %. Zbývající počet použití: 3.')).toBeTruthy();
    });

    it('opens on the term a code limited to one place is valid in', () => {
        render(
            <AiSupervizeMiniRegistrationForm
                initialDiscountCode="ONLINE_ONLY"
                initialActiveDiscountByPlaceId={{
                    ...NO_ACTIVE_DISCOUNTS,
                    [AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID]: {
                        code: 'ONLINE_ONLY',
                        percent: 25,
                        remainingUseCount: null,
                    },
                }}
                initialWorkshopAvailabilities={WORKSHOP_AVAILABILITIES}
            />,
        );

        const selectedWorkshopDateButton = screen
            .getAllByRole('button', { pressed: true })
            .find((button) => button.textContent?.includes('9. 9. 2026'));

        expect(selectedWorkshopDateButton).toBeTruthy();
        expect(screen.getByText('Aktivní sleva 25 %.')).toBeTruthy();
    });
});
