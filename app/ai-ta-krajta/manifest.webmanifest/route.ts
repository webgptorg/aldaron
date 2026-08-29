import { createAiTaKrajtaManifest } from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';

export const dynamic = 'force-static';

/**
 * Serves the podcast-specific installable web-app manifest.
 *
 * Next.js reserves the `manifest.ts` metadata convention for the root route, so a nested podcast manifest is an
 * ordinary route handler while keeping the standard `.webmanifest` address browsers expect.
 */
export function GET(): Response {
    return new Response(JSON.stringify(createAiTaKrajtaManifest()), {
        headers: {
            'Content-Type': 'application/manifest+json; charset=utf-8',
        },
    });
}
