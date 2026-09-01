/**
 * @vitest-environment jsdom
 */

import {
    COOKIE_PREFERENCES_SAVED_EVENT_NAME,
    ONLY_NECESSARY_COOKIES_ALLOWED,
    saveCookiePreferences,
} from '@/lib/legal/cookieConsentStorage';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
    localStorage.clear();
});

describe('cookie consent storage', () => {
    it('announces a saved choice to page surfaces which must leave room for the consent tray', () => {
        const onPreferencesSaved = vi.fn();

        window.addEventListener(COOKIE_PREFERENCES_SAVED_EVENT_NAME, onPreferencesSaved, { once: true });
        saveCookiePreferences(ONLY_NECESSARY_COOKIES_ALLOWED);

        expect(onPreferencesSaved).toHaveBeenCalledOnce();
        expect(localStorage.getItem('cookiesAccepted')).toBe('true');
    });
});
