/**
 * @vitest-environment jsdom
 */

import { WorkshopLinksPanel } from '@/components/workshops/WorkshopLinksPanel';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

const WORKSHOPS: readonly WorkshopSummary[] = [
    {
        id: 'workshop-id',
        kind: 'workshop',
        slug: 'production-ai-2026-09-10',
        title: 'Produkční kód s AI agenty',
        startsAt: '2026-09-10T19:00:00+02:00',
        endsAt: '2026-09-10T20:30:00+02:00',
        isPublished: true,
    },
];

afterEach(cleanup);

describe('workshop links panel', () => {
    it('links a community member to every workshop room with their identity prefilled', () => {
        render(
            <WorkshopLinksPanel
                workshops={WORKSHOPS}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                participantPath="/cs/online-workshop/participant"
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

    it('explains an empty workshop list without emitting a broken link', () => {
        render(
            <WorkshopLinksPanel
                workshops={[]}
                participantIdentity={{ fullname: 'Jana Nováková', email: 'jana@example.com' }}
                participantPath="/cs/online-workshop/participant"
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
