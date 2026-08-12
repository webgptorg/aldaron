import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Whether the page talks to the visitor formally or informally
 *
 * Note: Czech landing pages differ in this - the workshop and the podcast are on first-name terms with the reader,
 *       while the business pages are not - and a consent note which switches tone mid-page reads badly.
 */
export type AddressForm = 'formal' | 'informal';

/**
 * Sentence which tells the visitor what happens with the data they are about to send
 */
export type PersonalDataConsentNote = {
    /**
     * Text before the link to the privacy policy, ending with a space
     */
    readonly prefix: string;

    /**
     * Text of the link to the privacy policy, declined to fit the sentence
     */
    readonly privacyPolicyLinkText: string;
};

/**
 * Wording of the consent note in every language and tone the site is written in
 */
const PERSONAL_DATA_CONSENT_NOTES: Readonly<
    Record<SupportedHomepageLanguage, Readonly<Record<AddressForm, PersonalDataConsentNote>>>
> = {
    cs: {
        formal: {
            prefix: 'Odesláním souhlasíte se zpracováním osobních údajů podle ',
            privacyPolicyLinkText: 'zásad ochrany osobních údajů',
        },
        informal: {
            prefix: 'Odesláním souhlasíš se zpracováním osobních údajů podle ',
            privacyPolicyLinkText: 'zásad ochrany osobních údajů',
        },
    },
    en: {
        formal: {
            prefix: 'By submitting, you agree to the processing of your personal data under our ',
            privacyPolicyLinkText: 'privacy policy',
        },
        informal: {
            prefix: 'By submitting, you agree to the processing of your personal data under our ',
            privacyPolicyLinkText: 'privacy policy',
        },
    },
};

/**
 * Picks the consent note which fits the page
 *
 * @param language language the visitor is reading
 * @param addressForm tone the page talks to the visitor in
 */
export function getPersonalDataConsentNote(
    language: SupportedHomepageLanguage,
    addressForm: AddressForm,
): PersonalDataConsentNote {
    return PERSONAL_DATA_CONSENT_NOTES[language][addressForm];
}
