import { getLegalDocumentEffectiveDateLabel } from '@/lib/legal/legalDocumentEffectiveDate';
import { TERMS_AND_CONDITIONS_DOCUMENTS } from '@/lib/legal/termsAndConditionsDocuments';
import { describe, expect, it } from 'vitest';

function getStringParagraphs(language: 'cs' | 'en', heading: string): string {
    const section = TERMS_AND_CONDITIONS_DOCUMENTS[language].sections.find(
        (candidate) => candidate.heading === heading,
    );

    return (section?.paragraphs ?? [])
        .filter((paragraph): paragraph is string => typeof paragraph === 'string')
        .join(' ');
}

describe('community membership terms', () => {
    it('states a stable effective date for the materially updated terms', () => {
        expect(getLegalDocumentEffectiveDateLabel('cs')).toBe('Účinné od 26. srpna 2026');
        expect(getLegalDocumentEffectiveDateLabel('en')).toBe('Effective from August 26, 2026');
    });

    it('allows reasonable changes and operator termination without removing mandatory rights', () => {
        const czechChangeTerms = getStringParagraphs('cs', 'Změny a ukončení členství provozovatelem');

        expect(czechChangeTerms).toContain('kdykoli');
        expect(czechChangeTerms).toContain('alespoň 30 dnů');
        expect(czechChangeTerms).toContain('bez uvedení důvodu');
        expect(czechChangeTerms).toContain('nevzniká nárok na další náhradu');
        expect(czechChangeTerms).toContain('vrácení poměrné části ceny');
        expect(czechChangeTerms).toContain('Garance základní měsíční ceny');
    });

    it('keeps the English document aligned with the Czech membership clause', () => {
        const englishChangeTerms = getStringParagraphs('en', 'Changes and termination by the operator');

        expect(englishChangeTerms).toContain('at least 30 days');
        expect(englishChangeTerms).toContain('without stating a reason');
        expect(englishChangeTerms).toContain('pro-rata refund');
    });
});
