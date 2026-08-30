/**
 * @vitest-environment jsdom
 */

import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import { PROMPTBOOK_CODER_URL } from '@/components/promptbook-coder/promptbookCoderConfig';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('Promptbook coder badge', () => {
    it('leads to the page of Promptbook coder in a tab of its own', () => {
        render(<PromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link', { name: 'Done by Promptbook coder' });

        expect(badgeLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(badgeLink.getAttribute('target')).toBe('_blank');
        expect(badgeLink.getAttribute('rel')).toBe('noreferrer');
    });

    it('names the badge by its label alone, because the octopus repeats what the label already says', () => {
        render(<PromptbookCoderBadge />);

        const octopus = screen.getByRole('link').querySelector('svg');

        expect(octopus?.getAttribute('aria-hidden')).toBe('true');
    });

    it('keeps the look a page passes it instead of the one of a dark page', () => {
        render(<PromptbookCoderBadge className="mt-6" markClassName="text-white" />);

        const badgeLink = screen.getByRole('link');

        expect(badgeLink.className).toContain('mt-6');
        expect(badgeLink.querySelector('svg')?.getAttribute('class')).toContain('text-white');
    });
});
