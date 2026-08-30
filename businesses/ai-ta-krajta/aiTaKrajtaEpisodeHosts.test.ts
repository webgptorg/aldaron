import { readAiTaKrajtaEpisodeHostNames } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodeHosts';
import { describe, expect, it } from 'vitest';

describe('readAiTaKrajtaEpisodeHostNames', () => {
    it('reads the explicit roster even when a URL runs directly into its heading', () => {
        const hostNames = readAiTaKrajtaEpisodeHostNames(
            '<p>Zdroj: https://example.com/sourceHosté: 🤠 Petr Glaser: https://bleeding.dev/ 🤠 Pavol Hejný: https://ptbk.io/pavol Děkujeme sponzorům: Promptbook</p>',
        );

        expect(hostNames).toEqual(['Petr Glaser', 'Pavol Hejný']);
    });

    it('uses the published roster name when a description calls Katka by Kateřina', () => {
        const hostNames = readAiTaKrajtaEpisodeHostNames(
            'Hosté: 🤠 Kateřina Fajmanová: https://example.com/katka Sítě, kde nás můžete sledovat:',
        );

        expect(hostNames).toEqual(['Katka Fajmanová']);
    });

    it('does not read names from the episode discussion when no host roster exists', () => {
        expect(readAiTaKrajtaEpisodeHostNames('Pavol dnes mluví o AI agentech.')).toEqual([]);
    });

    it('keeps an explicitly listed name which has no profile card yet', () => {
        const hostNames = readAiTaKrajtaEpisodeHostNames(
            'Hosté: 🤠 Pavol Hejný: https://ptbk.io/pavol 🤠 Another Host: https://example.com/another Sítě, kde nás můžete sledovat:',
        );

        expect(hostNames).toEqual(['Pavol Hejný', 'Another Host']);
    });
});
