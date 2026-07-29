import { UrlShortener } from '@/components/url-shortener';
import { SHORTENER_METADATA } from '@/lib/metadata/site-page-definitions';
import { Metadata } from 'next';

// Force static generation for static export
export const dynamic = 'force-static';

export const metadata: Metadata = SHORTENER_METADATA;

export default function ShortenerPage() {
    return <UrlShortener />;
}

/**
 * TODO: Prompt: Shortener page should make metadata dynamic based on the landing page content stored in Supabase or the linked URL.
 */
