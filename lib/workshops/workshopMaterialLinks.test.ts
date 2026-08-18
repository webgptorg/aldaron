import { createWorkshopMaterialTrackingUrl } from '@/lib/workshops/workshopMaterialLinks';
import { describe, expect, it } from 'vitest';

describe('workshop material tracking links', () => {
    it('adds stable workshop UTM parameters without losing existing query parameters', () => {
        const trackingUrl = createWorkshopMaterialTrackingUrl(
            'https://example.com/material?download=1&utm_source=old-source',
            'online-workshop-2026-08-20',
            'content-123',
        );

        const parsedUrl = new URL(trackingUrl);
        expect(parsedUrl.searchParams.get('download')).toBe('1');
        expect(parsedUrl.searchParams.get('utm_source')).toBe('promptbook');
        expect(parsedUrl.searchParams.get('utm_medium')).toBe('workshop');
        expect(parsedUrl.searchParams.get('utm_campaign')).toBe('online-workshop-2026-08-20');
        expect(parsedUrl.searchParams.get('utm_content')).toBe('content-123');
    });

    it('does not rewrite in-page anchors or unsupported protocols', () => {
        expect(createWorkshopMaterialTrackingUrl('#slides', 'workshop', 'content')).toBe('#slides');
        expect(createWorkshopMaterialTrackingUrl('mailto:hello@example.com', 'workshop', 'content')).toBe(
            'mailto:hello@example.com',
        );
    });
});
