import { formatWorkshopWatchingCountLabel } from '@/businesses/online-workshop/participant/workshopWatchingCountLabel';
import { describe, expect, it } from 'vitest';

describe('workshop watching count label', () => {
    it('uses the singular for a lonely participant', () => {
        expect(formatWorkshopWatchingCountLabel(1)).toBe('Sleduje 1 člověk');
    });

    it('uses the Czech form for two up to four participants', () => {
        expect(formatWorkshopWatchingCountLabel(2)).toBe('Sledují 2 lidé');
        expect(formatWorkshopWatchingCountLabel(4)).toBe('Sledují 4 lidé');
    });

    it('uses the Czech form for five and more participants', () => {
        expect(formatWorkshopWatchingCountLabel(5)).toBe('Sleduje 5 lidí');
        expect(formatWorkshopWatchingCountLabel(21)).toBe('Sleduje 21 lidí');
        expect(formatWorkshopWatchingCountLabel(0)).toBe('Sleduje 0 lidí');
    });

    it('groups the digits of a large audience', () => {
        expect(formatWorkshopWatchingCountLabel(1234)).toMatch(/^Sleduje 1\D?234 lidí$/);
    });
});
