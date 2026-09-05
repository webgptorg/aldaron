/**
 * @vitest-environment jsdom
 */

import { PromptbookCoderBadge } from '@/components/promptbook-coder/PromptbookCoderBadge';
import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS } from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

/**
 * The one line of characters the badge wears, which no screen reader is told about
 */
function readDrawnOctopus(): string {
    return screen.getByRole('link').querySelector('[aria-hidden="true"]')?.textContent ?? '';
}

describe('PromptbookCoderBadge', () => {
    it('credits Promptbook coder and leads to its page in a new tab', () => {
        render(<PromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link', { name: PROMPTBOOK_CODER_BADGE_LABEL });

        expect(badgeLink.getAttribute('href')).toBe(PROMPTBOOK_CODER_URL);
        expect(badgeLink.getAttribute('target')).toBe('_blank');
        expect(badgeLink.getAttribute('rel')).toBe('noreferrer');
    });

    it('names the octopus nowhere, so the badge is read as its label alone', () => {
        render(<PromptbookCoderBadge />);

        // Note: The drawing repeats what the label already says, so a screen reader which read it too would say the
        //       same thing twice.
        expect(readDrawnOctopus()).toHaveLength(PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS);
        expect(screen.getByRole('link', { name: PROMPTBOOK_CODER_BADGE_LABEL })).toBeDefined();
    });

    it('is served with the octopus at work rather than mid-blink', () => {
        render(<PromptbookCoderBadge />);

        expect(readDrawnOctopus()).toBe('-<OO/>= { }');
    });

    it('waves back at a visitor who reaches the badge with the keyboard', () => {
        render(<PromptbookCoderBadge />);

        const badgeLink = screen.getByRole('link');

        fireEvent.focus(badgeLink);
        expect(readDrawnOctopus()).toBe('\\<^^w>/    ');

        fireEvent.blur(badgeLink);
        expect(readDrawnOctopus()).toBe('-<OO/>= { }');
    });

    it('takes the colours of the page it is worn on', () => {
        render(
            <PromptbookCoderBadge className="border-black/10" octopusClassName="text-black" labelClassName="max-w-0" />,
        );

        const badgeLink = screen.getByRole('link');

        expect(badgeLink.className).toContain('border-black/10');
        expect(badgeLink.querySelector('[aria-hidden="true"]')?.getAttribute('class')).toContain('text-black');
        expect(badgeLink.querySelector('span:not([aria-hidden])')?.getAttribute('class')).toContain('max-w-0');
    });
});
