import { createAiTaKrajtaIconSvg } from '@/businesses/ai-ta-krajta/aiTaKrajtaIcon';

export const dynamic = 'force-static';

/**
 * Serves the icon a browser draws in its tab, in its bookmarks and beside its address.
 *
 * Next.js reserves the `icon` metadata convention for an image checked into the repository, so an icon drawn from the
 * very snake the page draws is an ordinary route handler instead.
 */
export function GET(): Response {
    return new Response(createAiTaKrajtaIconSvg('rounded'), {
        headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
        },
    });
}
