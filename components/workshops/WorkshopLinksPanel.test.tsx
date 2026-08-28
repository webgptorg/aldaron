/**
 * @vitest-environment jsdom
 */

import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { formatEventPrice } from '@/lib/events/eventPrice';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const WORKSHOPS: readonly WorkshopSummary[] = [
    {
        id: 'workshop-id',
        kind: 'workshop',
        event: DEFAULT_EVENT_DETAILS,
        slug: 'production-ai-2026-09-10',
        title: 'Produkční kód s AI agenty',
        startsAt: '2026-09-10T19:00:00+02:00',
        endsAt: '2026-09-10T20:30:00+02:00',
        isPublished: true,
    },
];

const CALENDAR_SUBSCRIPTION = {
    url: 'webcal://ptbk.io/cs/komunita/calendar.ics',
    label: 'Odebírat kalendář',
} as const;

afterEach(cleanup);

describe('workshop links panel', () => {
    it('links a community member to every workshop room with their identity prefilled', () => {
        render(
            <WorkshopLinksPanel
                workshops={WORKSHOPS}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                title="Workshopy Promptbooku"
                description="Vyberte si workshop."
                emptyMessage="Žádný workshop není dostupný."
                locale="cs-CZ"
                timeZone="Europe/Prague"
            />,
        );

        expect(screen.getByRole('link', { name: /Produkční kód s AI agenty/ }).getAttribute('href')).toBe(
            '/cs/online-workshop/participant?workshop=production-ai-2026-09-10&email=jana%40example.com&fullname=Jana+Nov%C3%A1kov%C3%A1',
        );
    });

    it('offers a shared calendar subscription and a public iCalendar download for each listed term', () => {
        render(
            <WorkshopLinksPanel
                workshops={WORKSHOPS}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                title="Workshopy Promptbooku"
                description="Vyberte si workshop."
                emptyMessage="Žádný workshop není dostupný."
                locale="cs-CZ"
                timeZone="Europe/Prague"
                calendarSubscription={CALENDAR_SUBSCRIPTION}
            />,
        );

        expect(screen.getByRole('link', { name: 'Odebírat kalendář' }).getAttribute('href')).toBe(
            CALENDAR_SUBSCRIPTION.url,
        );

        const downloadLink = screen.getByRole('link', { name: 'Stáhnout .ics' });
        expect(downloadLink.getAttribute('download')).toBe('production-ai-2026-09-10.ics');
        expect(decodeURIComponent(downloadLink.getAttribute('href') ?? '')).toContain(
            'URL:https://ptbk.io/cs/online-workshop/participant?workshop=production-ai-2026-09-10',
        );
        expect(decodeURIComponent(downloadLink.getAttribute('href') ?? '')).not.toContain('jana@example.com');
    });

    it('leads a term of a paid workshop to its landing page instead of a room it does not have', () => {
        render(
            <WorkshopLinksPanel
                workshops={[
                    {
                        ...WORKSHOPS[0]!,
                        id: 'paid-workshop-id',
                        slug: 'ai-supervize-mini-2026-09-04',
                        title: 'AI Supervize Mini',
                        event: {
                            ...DEFAULT_EVENT_DETAILS,
                            type: 'ai-supervize-mini',
                            locationKind: 'onsite',
                            locationLabel: 'Praha',
                            priceCzk: 12000,
                        },
                    },
                ]}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                title="Termíny akcí"
                description="Vyberte si termín."
                emptyMessage="Žádný termín není dostupný."
                locale="cs-CZ"
                timeZone="Europe/Prague"
            />,
        );

        const paidWorkshopLink = screen.getByRole('link', { name: /AI Supervize Mini/ });
        expect(paidWorkshopLink.getAttribute('href')).toBe('/ai-supervize-mini');
        expect(paidWorkshopLink.textContent).toContain('Praha');
        expect(paidWorkshopLink.textContent).toContain(formatEventPrice(12000));
    });

    it('explains an empty workshop list without emitting a broken link', () => {
        render(
            <WorkshopLinksPanel
                workshops={[]}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                title="Workshopy Promptbooku"
                description="Vyberte si workshop."
                emptyMessage="Žádný workshop není dostupný."
                locale="cs-CZ"
                timeZone="Europe/Prague"
            />,
        );

        expect(screen.getByText('Žádný workshop není dostupný.')).not.toBeNull();
        expect(screen.queryByRole('link')).toBeNull();
    });
});
