import {
    createOnlineWorkshopStructuredData,
    ONLINE_WORKSHOP_PAGE_DEFINITION,
} from '@/businesses/online-workshop/onlineWorkshopMetadata';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { describe, expect, it } from 'vitest';

const UPCOMING_WORKSHOP: WorkshopSummary = {
    id: 'workshop-id',
    kind: 'workshop',
    slug: 'production-code-with-ai-2026-09-10',
    title: 'Produkční kód s AI agenty',
    startsAt: '2026-09-10T17:00:00.000Z',
    endsAt: '2026-09-10T18:00:00.000Z',
    isPublished: true,
};

describe('online workshop structured data', () => {
    it('describes the registration page and every scheduled public event without exposing a participant URL', () => {
        const structuredData = createOnlineWorkshopStructuredData([UPCOMING_WORKSHOP]);

        expect(structuredData).toHaveLength(2);
        expect(structuredData[0]).toMatchObject({
            '@type': 'WebPage',
            url: 'https://ptbk.io/cs/online-workshop',
            name: ONLINE_WORKSHOP_PAGE_DEFINITION.title,
        });
        expect(structuredData[1]).toMatchObject({
            '@type': 'Event',
            '@id': 'https://ptbk.io/cs/online-workshop#event-production-code-with-ai-2026-09-10',
            name: UPCOMING_WORKSHOP.title,
            startDate: UPCOMING_WORKSHOP.startsAt,
            endDate: UPCOMING_WORKSHOP.endsAt,
            url: 'https://ptbk.io/cs/online-workshop',
            location: {
                '@type': 'VirtualLocation',
                url: 'https://ptbk.io/cs/online-workshop',
            },
            offers: {
                price: '0',
                priceCurrency: 'CZK',
            },
        });
    });
});
