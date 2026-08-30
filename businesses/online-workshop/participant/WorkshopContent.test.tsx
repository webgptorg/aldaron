/**
 * @vitest-environment jsdom
 */

import { WorkshopContent } from '@/businesses/online-workshop/participant/WorkshopContent';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/markdown-content', () => ({
    MarkdownContent: ({ content, className }: { readonly content: string; readonly className?: string }) => {
        const markdownLinks = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));

        return (
            <div data-testid="markdown-content" className={className}>
                {markdownLinks.map((markdownLink) => (
                    <a key={markdownLink[2]} href={markdownLink[2]}>
                        {markdownLink[1]}
                    </a>
                ))}
            </div>
        );
    },
}));

vi.mock('@/components/promptbook-qr-code', () => ({
    PromptbookQrCode: ({ value, size, className }: { readonly value: string; readonly size?: number; readonly className?: string }) => (
        <span data-testid="workshop-material-qr-code" data-value={value} data-size={size} className={className} />
    ),
}));

const CONTENT_BLOCK: WorkshopContentBlock = {
    id: 'material-1',
    title: '',
    bodyMarkdown: '[Zjistit více](https://ptbk.io/material-abc123)',
    unlockAt: '2026-08-20T19:00:00.000Z',
    sortOrder: 0,
    isPublished: true,
    isFollowUp: false,
    createdAt: '2026-08-20T18:00:00.000Z',
    updatedAt: '2026-08-20T18:00:00.000Z',
    linkClickCount: 0,
};

function renderWorkshopContent(contentBlocks: readonly WorkshopContentBlock[]) {
    return render(
        <WorkshopContent
            contentBlocks={contentBlocks}
            nextContentUnlockAt={null}
            newlyUnlockedContentBlockIds={new Set()}
        />,
    );
}

afterEach(cleanup);

describe('workshop materials', () => {
    it('offers a prominent short-link call to action when a material has one link', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const callToAction = await screen.findByRole('link', { name: /Otevřít materiál: Zjistit více/ });

        expect(callToAction.getAttribute('href')).toBe('https://ptbk.io/material-abc123');
        expect(callToAction.getAttribute('target')).toBe('_blank');
        expect(callToAction.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('shows each material short link as a desktop-only QR code for opening on a phone', async () => {
        const secondContentBlock: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            id: 'material-2',
            bodyMarkdown: '[Stáhnout podklady](https://ptbk.io/material-def456)',
        };
        renderWorkshopContent([CONTENT_BLOCK, secondContentBlock]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-abc123',
            'https://ptbk.io/material-def456',
        ]);
        expect(qrCodes.every((qrCode) => qrCode.getAttribute('data-size') === '144')).toBe(true);
        expect(screen.getAllByLabelText('QR kódy materiálů')).toHaveLength(2);
        expect(screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('hidden'))).toBe(
            true,
        );
        expect(screen.getAllByLabelText('QR kódy materiálů').every((qrCodes) => qrCodes.className.includes('lg:flex'))).toBe(
            true,
        );
    });

    it('uses a compact white frame around every material QR code', async () => {
        renderWorkshopContent([CONTENT_BLOCK]);

        const qrCode = await screen.findByTestId('workshop-material-qr-code');

        expect(qrCode.parentElement?.className).toContain('p-2');
        expect(qrCode.parentElement?.className).not.toContain('p-3');
    });

    it('keeps multiple material links as light underlined links without a call to action', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://example.com/one) a [druhý materiál](https://example.com/two)',
        };
        const { container } = renderWorkshopContent([contentBlockWithMultipleLinks]);

        await waitFor(() => expect(container.querySelectorAll('a')).toHaveLength(2));

        expect(screen.queryByRole('link', { name: /Otevřít materiál/ })).toBeNull();
        expect(screen.getByTestId('markdown-content').className).toContain('[--chat-md-link-color:#f1f5f9]');
    });

    it('keeps every link of a multi-link material available through its own QR code', async () => {
        const contentBlockWithMultipleLinks: WorkshopContentBlock = {
            ...CONTENT_BLOCK,
            bodyMarkdown: '[První materiál](https://ptbk.io/material-one) a [druhý materiál](https://ptbk.io/material-two)',
        };
        renderWorkshopContent([contentBlockWithMultipleLinks]);

        const qrCodes = await screen.findAllByTestId('workshop-material-qr-code');

        expect(qrCodes.map((qrCode) => qrCode.getAttribute('data-value'))).toEqual([
            'https://ptbk.io/material-one',
            'https://ptbk.io/material-two',
        ]);
        expect(screen.getByLabelText('QR kód materiálu: První materiál')).not.toBeNull();
        expect(screen.getByLabelText('QR kód materiálu: druhý materiál')).not.toBeNull();
    });

    it('marks the selected follow-up material while it stays in the ordinary material list', () => {
        renderWorkshopContent([{ ...CONTENT_BLOCK, isFollowUp: true, title: 'Další krok' }]);

        expect(screen.getByText('Navazující materiál')).not.toBeNull();
        expect(screen.getByRole('heading', { name: 'Další krok' })).not.toBeNull();
    });
});
