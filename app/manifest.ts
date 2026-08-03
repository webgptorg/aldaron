import { SITE_BACKGROUND_COLOR, SITE_DESCRIPTION, SITE_NAME, SITE_THEME_COLOR } from '@/lib/metadata/site-config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Describes the site as an installable web application
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: '/',
        display: 'standalone',
        background_color: SITE_BACKGROUND_COLOR,
        theme_color: SITE_THEME_COLOR,
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
