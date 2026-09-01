/**
 * @vitest-environment jsdom
 */

import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import type { CookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const CONTENT: CookieConsentContent = {
    barTitle: 'Cookies',
    barDescription: 'We use cookies to keep the website working.',
    privacyNotePrefix: 'Details are in the ',
    privacyPolicyLinkText: 'privacy policy',
    customizeButton: 'Customize',
    acceptAllButton: 'Accept all',
    settingsTitle: 'Cookie settings',
    settingsDescription: 'Choose the cookies we may store.',
    saveButton: 'Save settings',
    necessaryCategory: { title: 'Necessary', description: 'Required for the website.' },
    analyticsCategory: { title: 'Analytics', description: 'Measures usage.' },
    marketingCategory: { title: 'Marketing', description: 'Measures advertising.' },
};

afterEach(cleanup);

describe('cookie consent banner', () => {
    it('keeps the shared controls and exposes its page appearance without duplicating the layout', () => {
        const onOpenSettings = vi.fn();
        const onAcceptAll = vi.fn();
        const { container } = render(
            <CookieConsentBanner
                appearance="podcast"
                content={CONTENT}
                privacyPolicyPath="/en/privacy-policy"
                onOpenSettings={onOpenSettings}
                onAcceptAll={onAcceptAll}
            />,
        );

        const banner = container.querySelector('[data-cookie-consent]');

        expect(banner).not.toBeNull();
        expect(banner?.getAttribute('data-cookie-consent-appearance')).toBe('podcast');
        expect(screen.getByRole('link', { name: 'privacy policy' }).getAttribute('href')).toBe('/en/privacy-policy');

        fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
        fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));

        expect(onOpenSettings).toHaveBeenCalledOnce();
        expect(onAcceptAll).toHaveBeenCalledOnce();
    });
});
