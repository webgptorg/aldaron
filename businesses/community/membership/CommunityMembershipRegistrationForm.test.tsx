/**
 * @vitest-environment jsdom
 */

import type { DiscountCodeValidation } from '@/lib/discounts/useDiscountCodeValidation';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { InputHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { submitCommunityMembershipRegistrationMock } = vi.hoisted(() => ({
    submitCommunityMembershipRegistrationMock: vi.fn(),
}));

vi.mock('./communityMembershipRegistrationApi', () => ({
    submitCommunityMembershipRegistration: submitCommunityMembershipRegistrationMock,
}));

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({
        checked,
        onCheckedChange,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean;
        onCheckedChange?: (isChecked: boolean) => void;
    }) => (
        <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        />
    ),
}));

import { CommunityMembershipRegistrationForm } from './CommunityMembershipRegistrationForm';

function createDiscountCodeValidation(): DiscountCodeValidation {
    return {
        discountCode: '',
        setDiscountCode: vi.fn(),
        activeDiscount: null,
        isValidationPending: false,
        validationError: null,
    };
}

describe('community membership registration form', () => {
    afterEach(() => {
        cleanup();
        submitCommunityMembershipRegistrationMock.mockReset();
    });

    it('preserves the supplied identity and offers only the 199 Kč monthly membership', () => {
        render(
            <CommunityMembershipRegistrationForm
                initialFullname="Jana Nováková"
                initialEmail="jana@example.com"
                discountCodeValidation={createDiscountCodeValidation()}
            />,
        );

        expect((screen.getByLabelText('Jméno a příjmení') as HTMLInputElement).value).toBe('Jana Nováková');
        expect((screen.getByLabelText('E-mail') as HTMLInputElement).value).toBe('jana@example.com');
        expect(screen.getByText('199 Kč měsíčně')).toBeTruthy();
        expect(screen.getByText('Živé AI webináře zůstávají zdarma.')).toBeTruthy();
        expect(screen.getByText(/Členství můžete kdykoli zrušit\./)).toBeTruthy();
        expect(screen.queryByText(/7 dní zdarma/i)).toBeNull();
        expect(screen.queryByText('Premium')).toBeNull();
        expect(screen.queryByText('Ročně')).toBeNull();
    });

    it('submits the new membership as a monthly payment request without a trial', async () => {
        submitCommunityMembershipRegistrationMock.mockResolvedValue({
            planId: 'membership',
            billingPeriod: 'monthly',
            price: {
                baseBillingPriceCzk: 199,
                discountAmountCzk: 0,
                finalBillingPriceCzk: 199,
                baseMonthlyEquivalentCzk: 199,
                finalMonthlyEquivalentCzk: 199,
            },
            activeDiscount: null,
            trialDayCount: null,
        });

        render(
            <CommunityMembershipRegistrationForm
                initialFullname="Jana Nováková"
                initialEmail="jana@example.com"
                discountCodeValidation={createDiscountCodeValidation()}
            />,
        );

        fireEvent.click(screen.getByLabelText('Souhlasím s obchodními podmínkami'));
        fireEvent.click(screen.getByRole('button', { name: 'Chci placené členství za 199 Kč / měsíc' }));

        await waitFor(() => {
            expect(submitCommunityMembershipRegistrationMock).toHaveBeenCalledWith({
                planId: 'membership',
                billingPeriod: 'monthly',
                fullname: 'Jana Nováková',
                email: 'jana@example.com',
                discountCode: '',
                termsAccepted: true,
            });
        });
        expect(await screen.findByText('Jana Nováková, připravujeme vaše placené členství.')).toBeTruthy();
        expect(screen.getByText('Platba každý měsíc, bez ročního závazku.')).toBeTruthy();
    });
});
