/**
 * @vitest-environment jsdom
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/businesses/ai-supervize-mini/workshopRegistrationApi', () => ({
    AiSupervizeMiniWorkshopRegistrationError: class AiSupervizeMiniWorkshopRegistrationError extends Error {},
    submitAiSupervizeMiniWorkshopRegistration: vi.fn(),
}));

vi.mock('@/businesses/ai-supervize-mini/discountCodeApi', () => ({
    validateAiSupervizeMiniDiscountCode: vi.fn().mockResolvedValue(null),
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
                initialWorkshopAvailabilities={[
                    { workshopDateId: '2026-09-04', registeredParticipantCount: 0, remainingSeatCount: 10 },
                    { workshopDateId: '2026-09-09', registeredParticipantCount: 0, remainingSeatCount: 50 },
                ]}
            />,
        );

        expect((screen.getByLabelText('Slevový kód') as HTMLInputElement).value).toBe('webinar-2026-08-20');
    });
});
