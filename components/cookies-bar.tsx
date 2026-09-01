'use client';

import { getLanguageFromPathname } from '@/lib/language/pageLanguage';
import { getCookieConsentAppearance } from '@/lib/legal/cookieConsentAppearance';
import { getCookieConsentContent } from '@/lib/legal/cookieConsentContent';
import { ALL_COOKIES_ALLOWED, isCookieChoiceMade, saveCookiePreferences } from '@/lib/legal/cookieConsentStorage';
import { COOKIE_SETTINGS_HASH } from '@/lib/legal/cookieSettingsHash';
import { getLegalPagePath } from '@/lib/legal/legalPagePaths';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CookieConsentBanner } from './cookie-consent-banner';
import { CookieSettingsModal } from './cookie-settings-modal';

export function CookiesBar() {
    const pathname = usePathname();
    const language = getLanguageFromPathname(pathname);
    const content = getCookieConsentContent(language);
    const appearance = getCookieConsentAppearance(pathname);
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Note: A visitor who follows the cookie settings link gets the bar back, even though they answered it before -
        //       withdrawing a consent has to be as easy as giving it.
        const showBarWhenSettingsRequested = () => {
            if (window.location.hash === COOKIE_SETTINGS_HASH) {
                setIsVisible(true);
            }
        };

        if (!isCookieChoiceMade()) {
            setIsVisible(true);
        }

        showBarWhenSettingsRequested();

        window.addEventListener('hashchange', showBarWhenSettingsRequested);
        return () => window.removeEventListener('hashchange', showBarWhenSettingsRequested);
    }, []);

    const handleAcceptAll = () => {
        saveCookiePreferences(ALL_COOKIES_ALLOWED);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <>
            <CookieConsentBanner
                appearance={appearance}
                content={content}
                privacyPolicyPath={getLegalPagePath('privacyPolicy', language)}
                onOpenSettings={() => setIsModalOpen(true)}
                onAcceptAll={handleAcceptAll}
            />
            <CookieSettingsModal
                language={language}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={() => setIsVisible(false)}
            />
        </>
    );
}
