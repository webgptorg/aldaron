import { createCzkFromStripeAmount, createStripeAmountFromCzk } from '@/lib/payments/stripeAmount';
import { describe, expect, it } from 'vitest';

describe('stripe amount', () => {
    it('charges a whole price in the smallest unit of the currency', () => {
        expect(createStripeAmountFromCzk(199)).toBe(19_900);
    });

    it('rounds a price with fractional crowns to something a card can be charged', () => {
        expect(createStripeAmountFromCzk(133.5)).toBe(13_350);
        expect(createStripeAmountFromCzk(133.334)).toBe(13_333);
    });

    it('reads an amount the gate reported back as whole crowns', () => {
        expect(createCzkFromStripeAmount(19_900)).toBe(199);
    });
});
