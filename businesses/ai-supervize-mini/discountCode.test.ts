import { describe, expect, it } from 'vitest';
import { getAiSupervizeMiniActiveDiscount, normalizeAiSupervizeMiniDiscountCode } from './discountCode';

describe('AI Supervize Mini webinar discount', () => {
    it('normalizes the code from a URL or manually typed input', () => {
        expect(normalizeAiSupervizeMiniDiscountCode(' webinar-2026-08-20 ')).toBe('WEBINAR_2026_08_20');
    });

    it('applies 25 percent for the entire Prague webinar day', () => {
        expect(getAiSupervizeMiniActiveDiscount('webinar-2026-08-20', new Date('2026-08-20T12:00:00+02:00'))).toEqual({
            code: 'WEBINAR_2026_08_20',
            percent: 25,
        });
    });

    it('does not apply before or after the one-day validity window', () => {
        expect(getAiSupervizeMiniActiveDiscount('webinar-2026-08-20', new Date('2026-08-19T23:59:59+02:00'))).toBe(
            null,
        );
        expect(getAiSupervizeMiniActiveDiscount('webinar-2026-08-20', new Date('2026-08-21T00:00:00+02:00'))).toBe(
            null,
        );
    });
});
