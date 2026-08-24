/**
 * @vitest-environment jsdom
 */

import { ShortcodeLinkAdmin } from '@/components/shortener/ShortcodeLinkAdmin';
import type { ShortcodeLink } from '@/lib/shortener/shortcodeLink';
import { fetchAdminShortcodeLinks } from '@/lib/shortener/shortcodeLinkAdminApiClient';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/url-shortener', () => ({
    UrlShortener: () => <div data-testid="url-shortener" />,
}));

vi.mock('@/lib/shortener/shortcodeLinkAdminApiClient', () => ({
    deleteAdminShortcodeLink: vi.fn(),
    fetchAdminShortcodeLinks: vi.fn(),
    updateAdminShortcodeLink: vi.fn(),
}));

const SHORTCODE_LINKS: readonly ShortcodeLink[] = [
    {
        id: 3,
        createdAt: '2026-08-24T12:00:00.000Z',
        shortcode: 'workshop-link',
        urls: ['https://example.com/workshop'],
        note: null,
        landingPage: null,
        isAdHoc: true,
        sourceApp: 'online-workshop',
    },
    {
        id: 1,
        createdAt: '2026-08-24T10:00:00.000Z',
        shortcode: 'manual-link',
        urls: ['https://example.com/manual'],
        note: 'campaign',
        landingPage: null,
        isAdHoc: false,
        sourceApp: 'admin-shortener',
    },
    {
        id: 2,
        createdAt: '2026-08-24T11:00:00.000Z',
        shortcode: 'community-link',
        urls: ['https://example.com/community'],
        note: null,
        landingPage: null,
        isAdHoc: true,
        sourceApp: 'community',
    },
];

const fetchAdminShortcodeLinksMock = vi.mocked(fetchAdminShortcodeLinks);

afterEach(() => {
    cleanup();
    fetchAdminShortcodeLinksMock.mockReset();
});

describe('shortcode link administration', () => {
    it('filters and sorts links by their immutable creation provenance', async () => {
        fetchAdminShortcodeLinksMock.mockResolvedValue(SHORTCODE_LINKS);
        render(<ShortcodeLinkAdmin />);

        await screen.findByRole('link', { name: 'manual-link' });
        expect(screen.getByRole('cell', { name: 'Created manually' })).not.toBeNull();
        expect(screen.getAllByRole('cell', { name: 'Ad hoc' })).toHaveLength(2);
        expect(screen.getByRole('cell', { name: 'Online workshop' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Creation type'), { target: { value: 'ad-hoc' } });

        await waitFor(() => expect(screen.queryByRole('link', { name: 'manual-link' })).toBeNull());
        expect(screen.getByRole('link', { name: 'workshop-link' })).not.toBeNull();
        expect(screen.getByRole('link', { name: 'community-link' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Source application'), { target: { value: 'community' } });

        await waitFor(() => expect(screen.queryByRole('link', { name: 'workshop-link' })).toBeNull());
        expect(screen.getByRole('link', { name: 'community-link' })).not.toBeNull();

        fireEvent.change(screen.getByLabelText('Creation type'), { target: { value: 'all' } });
        fireEvent.change(screen.getByLabelText('Source application'), { target: { value: 'all' } });
        fireEvent.change(screen.getByLabelText('Sort short links by'), { target: { value: 'sourceApp' } });
        fireEvent.change(screen.getByLabelText('Short-link sort direction'), { target: { value: 'ascending' } });

        await waitFor(() => {
            const shortcodeRows = Array.from(screen.getByRole('table').querySelectorAll('tbody tr')).map(
                (row) => row.textContent ?? '',
            );
            expect(shortcodeRows[0]).toContain('manual-link');
            expect(shortcodeRows[1]).toContain('community-link');
            expect(shortcodeRows[2]).toContain('workshop-link');
        });
    });
});
