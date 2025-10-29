import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Metadata } from 'next';
import { UrlShortener } from '@/components/url-shortener';

// Force static generation for static export
export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
    return {
        title: '✨ AI Transformation for Your Business | Promptbook',
        description: 'Create AI agents that truly understand your company with Promptbook.',
    };
}

export default function ShortenerPage() {
    return (
        <main className="min-h-screen">
            <Header />
               <UrlShortener />
            <Footer />
        </main>
    );
}
