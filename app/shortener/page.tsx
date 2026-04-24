import { UrlShortener } from '@/components/url-shortener';
import { Metadata } from 'next';

// Force static generation for static export
export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
    return {
        title: '✨ AI Transformation for Your Business | Promptbook',
        description: 'Create AI agents that truly understand your company with Promptbook.',
    };
}

export default function ShortenerPage() {
    return <UrlShortener />;
}

/**
 * TODO: Prompt: Shortener page should make metadata dynamic based on the landing page content stored in Supabase or the linked URL.
 */
