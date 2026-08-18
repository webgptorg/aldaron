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
});
