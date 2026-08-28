/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/discounts/ScrollToRegistrationSection', () => ({
    ScrollToRegistrationSection: () => null,
}));

vi.mock('@/components/header', () => ({
    Header: ({
        brandContext,
        primaryAction,
    }: {
        brandContext?: { label: string };
        primaryAction?: { label: string; href: string };
    }) => (
        <header>
            <span>Promptbook &gt; {brandContext?.label}</span>
            <a href={primaryAction?.href}>{primaryAction?.label}</a>
        </header>
    ),
}));

vi.mock('@/components/minimal-footer', () => ({
    MinimalFooter: () => <footer>Footer</footer>,
}));

vi.mock('@/lib/discounts/useDiscountCodeValidation', () => ({
    useDiscountCodeValidation: () => ({
        discountCode: '',
        setDiscountCode: vi.fn(),
        activeDiscount: null,
        isValidationPending: false,
        validationError: null,
    }),
}));

vi.mock('./CommunityMembershipIllustration', () => ({
    CommunityMembershipIllustration: () => <div>Ilustrace komunity</div>,
}));

vi.mock('./CommunityMembershipRegistrationForm', () => ({
    CommunityMembershipRegistrationForm: ({
        initialFullname,
        initialEmail,
    }: {
        initialFullname: string;
        initialEmail: string;
    }) => <div data-testid="registration-form" data-fullname={initialFullname} data-email={initialEmail} />,
}));

import { CommunityMembershipPage } from './CommunityMembershipPage';

describe('community membership page', () => {
    it('presents free live webinars and one 199 Kč monthly paid option', () => {
        render(
            <CommunityMembershipPage
                initialFullname="Pavol Hejný"
                initialEmail="pavol@example.com"
                initialDiscountCode=""
                initialActiveDiscountByPlaceId={{}}
            />,
        );

        expect(screen.getByText('Promptbook > Komunita')).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Pavol Hejný, živé webináře máte zdarma.' })).toBeTruthy();
        expect(screen.getByText('Komunita zdarma')).toBeTruthy();
        expect(screen.getAllByText('Placené členství').length).toBeGreaterThan(0);
        expect(screen.getByText('199 Kč / měsíc')).toBeTruthy();
        expect(screen.getAllByText('Zrušení e-mailem').length).toBeGreaterThan(0);
        expect(screen.getByText('Záznamy a archiv webinářů')).toBeTruthy();
        expect(screen.getByText('Placená část komunitního Discordu')).toBeTruthy();
        expect(screen.queryByText('Premium')).toBeNull();
        expect(screen.queryByText('Standard')).toBeNull();
        expect(screen.queryByText(/7 dní zdarma/i)).toBeNull();
        expect(screen.queryByText('Ročně')).toBeNull();

        const registrationForm = screen.getByTestId('registration-form');
        expect(registrationForm.getAttribute('data-fullname')).toBe('Pavol Hejný');
        expect(registrationForm.getAttribute('data-email')).toBe('pavol@example.com');
    });
});
