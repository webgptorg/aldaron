/**
 * @vitest-environment jsdom
 */

import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

describe('PromptbookCoderBadge', () => {
    it('credits Promptbook coder and leads to its page in a new tab', () => {
        render(<PromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link', { name: PROMPTBOOK_CODER_BADGE_LABEL });

        expect(badgeLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(badgeLink.getAttribute('target')).toBe('_blank');
        expect(badgeLink.getAttribute('rel')).toBe('noreferrer');
    });

    it('names the octopus nowhere, so the badge reads as its label alone', () => {
        render(<PromptbookCoderBadge />);

        // Note: The drawing repeats what the label already says, so a screen reader which read it too would say the
        //       same thing twice.
        const octopus = document.querySelector('svg');

        expect(octopus?.getAttribute('aria-hidden')).toBe('true');
        expect(screen.getByRole('link').textContent).toBe(PROMPTBOOK_CODER_BADGE_LABEL);
    });

    it('takes the colours of the page it is worn on', () => {
        render(<PromptbookCoderBadge className="border-black/10" markClassName="text-black" />);

        const badgeLink = screen.getByRole('link');

        expect(badgeLink.className).toContain('border-black/10');
        expect(document.querySelector('svg')?.getAttribute('class')).toContain('text-black');
    });
});
