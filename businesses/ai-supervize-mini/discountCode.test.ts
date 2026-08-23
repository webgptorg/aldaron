import { describe, expect, it } from 'vitest';
import {
    isAiSupervizeMiniDiscountActive,
    isAiSupervizeMiniDiscountCodeNormalized,
    normalizeAiSupervizeMiniDiscountCode,
} from './discountCode';

describe('AI Supervize Mini discount-code rules', () => {
    it('normalizes the code from a URL or manually typed input', () => {
        expect(normalizeAiSupervizeMiniDiscountCode(' webinar-2026-08-20 ')).toBe('WEBINAR_2026_08_20');
    });

    it('accepts only the normalized form that the database stores', () => {
        expect(isAiSupervizeMiniDiscountCodeNormalized('WEBINAR_2026_08_20')).toBe(true);
        expect(isAiSupervizeMiniDiscountCodeNormalized('webinar-2026-08-20')).toBe(false);
    });

    it('applies an enabled discount throughout its inclusive validity window', () => {
        const discountCode = {
            startsAt: '2026-08-20T00:00:00+02:00',
            endsAt: '2026-08-20T23:59:59.999+02:00',
            isEnabled: true,
        };

        expect(isAiSupervizeMiniDiscountActive(discountCode, new Date('2026-08-20T12:00:00+02:00'))).toBe(true);
        expect(isAiSupervizeMiniDiscountActive(discountCode, new Date('2026-08-19T23:59:59+02:00'))).toBe(false);
        expect(isAiSupervizeMiniDiscountActive(discountCode, new Date('2026-08-21T00:00:00+02:00'))).toBe(false);
    });

    it('does not apply a disabled discount even while its validity window is open', () => {
        expect(
            isAiSupervizeMiniDiscountActive(
                {
                    startsAt: '2026-08-20T00:00:00+02:00',
                    endsAt: '2026-08-20T23:59:59.999+02:00',
                    isEnabled: false,
                },
                new Date('2026-08-20T12:00:00+02:00'),
            ),
        ).toBe(false);
    });
});
