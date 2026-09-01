import type { CookieConsentAppearance } from '@/lib/legal/cookieConsentAppearance';
import type { CookieConsentContent } from '@/lib/legal/cookieConsentContent';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_TITLE_ID = 'cookie-consent-title';

type CookieConsentBannerProps = {
    readonly appearance: CookieConsentAppearance;
    readonly content: CookieConsentContent;
    readonly privacyPolicyPath: string;
    readonly onOpenSettings: () => void;
    readonly onAcceptAll: () => void;
};

/**
 * The responsive, presentational part of cookie consent.
 *
 * Keeping this separate from the storage and modal state lets every page share one layout while the few pages with
 * an independent identity can select a visual language instead of copying the whole banner.
 */
export function CookieConsentBanner({
    appearance,
    content,
    privacyPolicyPath,
    onOpenSettings,
    onAcceptAll,
}: CookieConsentBannerProps) {
    return (
        <aside
            aria-labelledby={COOKIE_CONSENT_TITLE_ID}
            aria-live="polite"
            className="cookie-consent"
            data-cookie-consent
            data-cookie-consent-appearance={appearance}
        >
            <div className="cookie-consent__panel">
                <div className="cookie-consent__copy">
                    <span aria-hidden className="cookie-consent__icon">
                        <Cookie />
                    </span>
                    <div className="min-w-0">
                        <h2 id={COOKIE_CONSENT_TITLE_ID} className="cookie-consent__title">
                            {content.barTitle}
                        </h2>
                        <p className="cookie-consent__description">{content.barDescription}</p>
                        <p className="cookie-consent__privacy-note">
                            {content.privacyNotePrefix}
                            <Link href={privacyPolicyPath}>{content.privacyPolicyLinkText}</Link>.
                        </p>
                    </div>
                </div>

                <div className="cookie-consent__actions">
                    <button
                        type="button"
                        className="cookie-consent__button cookie-consent__button--secondary"
                        onClick={onOpenSettings}
                    >
                        {content.customizeButton}
                    </button>
                    <button
                        type="button"
                        className="cookie-consent__button cookie-consent__button--primary"
                        onClick={onAcceptAll}
                    >
                        {content.acceptAllButton}
                    </button>
                </div>
            </div>
        </aside>
    );
}
