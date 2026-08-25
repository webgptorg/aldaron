/**
 * @vitest-environment jsdom
 */

import { WorkshopCommentMarkdown } from '@/components/workshop-comment-markdown';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('workshop comment Markdown', () => {
    it('renders only the supported text formatting and leaves rich content inert', () => {
        const { container } = render(
            <WorkshopCommentMarkdown content={'**tučně** *kurzíva* __podtržení__ <img src="bad"> ![obrázek](https://bad.example)'} />,
        );

        expect(screen.getByText('tučně').tagName).toBe('STRONG');
        expect(screen.getByText('kurzíva').tagName).toBe('EM');
        expect(screen.getByText('podtržení').tagName).toBe('U');
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('a')).toBeNull();
        expect(container.textContent).toContain('<img src="bad">');
        expect(container.textContent).toContain('![obrázek](https://bad.example)');
    });

    it('activates only persisted shortcode URLs when a trusted source explicitly enables links', () => {
        const content =
            '[Otevřít návod](https://ptbk.io/moderator-guide) a https://ptbk.io/moderator-video. Původní https://example.com/raw zůstává textem.';
        const { container, rerender } = render(<WorkshopCommentMarkdown content={content} />);

        expect(container.querySelector('a')).toBeNull();

        rerender(<WorkshopCommentMarkdown content={content} isLinksEnabled />);

        const links = screen.getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href'))).toEqual([
            'https://ptbk.io/moderator-guide',
            'https://ptbk.io/moderator-video',
        ]);
        expect(links.every((link) => link.getAttribute('target') === '_blank')).toBe(true);
        expect(links.every((link) => link.getAttribute('rel') === 'noopener noreferrer')).toBe(true);
        expect(container.textContent).toContain('https://example.com/raw');
    });

    it('keeps shortcode-looking text inert inside code, images, and HTML', () => {
        const { container } = render(
            <WorkshopCommentMarkdown
                isLinksEnabled
                content={'`https://ptbk.io/code` ![obrázek](https://ptbk.io/image) <a href="https://ptbk.io/html">HTML</a>'}
            />,
        );

        expect(container.querySelector('a')).toBeNull();
        expect(container.querySelector('img')).toBeNull();
    });
});
