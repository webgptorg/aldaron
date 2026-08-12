import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { ORGANIZATION_LEGAL_NAME, ORGANIZATION_REGISTRATION_NUMBER } from '@/lib/metadata/site-config';

/**
 * Address which answers everything about personal data - requests of the data subjects, questions about the policy
 */
export const PRIVACY_CONTACT_EMAIL = 'privacy@ptbk.io';

/**
 * Address which answers everything about the contract - the terms, the orders, the invoices
 */
export const LEGAL_CONTACT_EMAIL = 'legal@ptbk.io';

/**
 * How the company which stands behind the site introduces itself in each language
 */
const OPERATOR_IDENTIFICATIONS: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: `${ORGANIZATION_LEGAL_NAME}, IČO ${ORGANIZATION_REGISTRATION_NUMBER}, zapsaná v obchodním rejstříku`,
    en: `${ORGANIZATION_LEGAL_NAME}, company number ${ORGANIZATION_REGISTRATION_NUMBER}, registered in the Czech commercial register`,
};

/**
 * Builds the sentence fragment which identifies the company behind the site
 *
 * Note: Both legal documents have to name the very same company, so they both ask this one place.
 *
 * @param language language the document is written in
 */
export function getOperatorIdentification(language: SupportedHomepageLanguage): string {
    return OPERATOR_IDENTIFICATIONS[language];
}
