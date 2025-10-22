import { AvatarBookSection } from '@/components/avatar-book-section';
import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { UrlShortener } from '@/components/url-shortener';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Force static generation for static export
export const dynamic = 'force-static';

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export function generateMetadata(): Metadata {
    return {
        title: '✨ AI Transformation for Your Business | Promptbook',
        description: 'Create AI agents that truly understand your company with Promptbook.',
    };
}

export default function Home({ searchParams }: Props) {
    console.log('Home page rendered');

    return (
        <main className="min-h-screen">
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <HeroSection />
            </Suspense>
            <BenefitsSection />
            <IntegrationsSection />
            <AvatarBookSection />
            <PricingSection />
            <UrlShortener />
            <Footer />
        </main>
    );
}
