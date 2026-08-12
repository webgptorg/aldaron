import type { FooterProps } from '@/components/footer';

/**
 * Footer of a Czech landing page
 *
 * Note: The footer already knows all of its Czech wording, so this only says which language the page is in and drops
 *       the playground link, which does not belong on a landing page sold to a Czech business.
 */
export const czechBusinessFooterProps: FooterProps = {
    language: 'cs',
    productLinks: [
        { href: '?modal=get-started', text: 'Začít' },
        { href: 'https://ptbk.io/', text: 'Promptbook' },
        { href: 'https://github.com/webgptorg/promptbook', text: 'Dokumentace' },
        { href: '/branding', text: 'Branding' },
    ],
};
