import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Day the published wording of the legal documents took effect
 *
 * Note: It is written down instead of being taken from the clock, because a legal document has to state the day its
 *       wording started to apply, not the day the page happened to be rendered.
 */
const LEGAL_DOCUMENTS_EFFECTIVE_DATE = new Date('2026-08-12T00:00:00Z');

/**
 * Locale the effective date is written in for each language of the site
 */
const EFFECTIVE_DATE_LOCALES: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'cs-CZ',
    en: 'en-US',
};

/**
 * Wording which introduces the effective date in each language of the site
 */
const EFFECTIVE_DATE_PREFIXES: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'Účinné od',
    en: 'Effective from',
};

/**
 * Builds the line which tells since when the document applies, for example `Účinné od 12. srpna 2026`
 *
 * @param language language the document is written in
 */
export function getLegalDocumentEffectiveDateLabel(language: SupportedHomepageLanguage): string {
    const formattedDate = new Intl.DateTimeFormat(EFFECTIVE_DATE_LOCALES[language], {
        dateStyle: 'long',
        timeZone: 'UTC',
    }).format(LEGAL_DOCUMENTS_EFFECTIVE_DATE);

    return `${EFFECTIVE_DATE_PREFIXES[language]} ${formattedDate}`;
}
