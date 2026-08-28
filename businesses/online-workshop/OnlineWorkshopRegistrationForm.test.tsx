/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
    default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

import { OnlineWorkshopRegistrationForm } from './OnlineWorkshopRegistrationForm';

const FIRST_WORKSHOP = {
    id: 'first-workshop-id',
    kind: 'workshop' as const,
    slug: 'production-ai-2026-09-04',
    title: 'Produkční kód s AI agenty',
    startsAt: '2026-09-04T16:00:00+02:00',
    endsAt: '2026-09-04T17:00:00+02:00',
    isPublished: true,
    event: null,
};

const SECOND_WORKSHOP = {
    id: 'second-workshop-id',
    kind: 'workshop' as const,
    slug: 'git-a-ai-2026-09-09',
    title: 'Git a AI',
    startsAt: '2026-09-09T13:00:00+02:00',
    endsAt: '2026-09-09T14:00:00+02:00',
    isPublished: true,
    event: null,
};

describe('Online workshop registration form', () => {
    afterEach(() => {
        cleanup();
    });

    it('uses one form to choose between terms without clearing contact details', () => {
        const { container } = render(<OnlineWorkshopRegistrationForm workshops={[FIRST_WORKSHOP, SECOND_WORKSHOP]} />);

        expect(container.querySelectorAll('form')).toHaveLength(1);

        const firstWorkshopButton = screen.getByRole('button', { name: /4\. 9\. 2026/ });
        const secondWorkshopButton = screen.getByRole('button', { name: /9\. 9\. 2026/ });
        expect(firstWorkshopButton.getAttribute('aria-pressed')).toBe('true');
        expect(secondWorkshopButton.getAttribute('aria-pressed')).toBe('false');

        fireEvent.change(screen.getByLabelText('Jméno'), { target: { value: 'Jana Nováková' } });
        fireEvent.click(secondWorkshopButton);

        expect(firstWorkshopButton.getAttribute('aria-pressed')).toBe('false');
        expect(secondWorkshopButton.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText(SECOND_WORKSHOP.title)).toBeTruthy();
        expect((screen.getByLabelText('Jméno') as HTMLInputElement).value).toBe('Jana Nováková');
    });

    it('offers no registration form until an online workshop is published', () => {
        const { container } = render(<OnlineWorkshopRegistrationForm workshops={[]} />);

        expect(container.querySelector('form')).toBeNull();
        expect(screen.getByText(/Zatím není vypsaný žádný další termín\./)).toBeTruthy();
    });
});
