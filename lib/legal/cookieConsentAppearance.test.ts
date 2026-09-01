import { getCookieConsentAppearance } from '@/lib/legal/cookieConsentAppearance';
import { describe, expect, it } from 'vitest';

describe('cookie consent appearance', () => {
    it('keeps the shared treatment on ordinary pages', () => {
        expect(getCookieConsentAppearance('/ai-supervize')).toBe('default');
        expect(getCookieConsentAppearance(null)).toBe('default');
    });

    it('uses the podcast treatment across the whole podcast page family', () => {
        expect(getCookieConsentAppearance('/ai-ta-krajta')).toBe('podcast');
        expect(getCookieConsentAppearance('/ai-ta-krajta/media-kit')).toBe('podcast');
    });
});
