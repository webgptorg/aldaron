import { AvatarBookSection } from '@/components/avatar-book-section';
import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Force static generation for static export
export const dynamic = 'force-static';

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export function generateMetadata(): Metadata {
    // For static export, we can't use searchParams in generateMetadata
    // The dynamic title will be handled client-side
    return {
        title: '✨ Make AI that Thinks Like You',
        description: 'Reclaim Your Time with AI That Thinks Like You ✨ Powered by Promptbook',
    };
}

/**
 * ROT13 decoder function
 */
function rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
}

export default function Home({ searchParams }: Props) {
    console.log('Home page rendered');

    return (
        <main className="min-h-screen">
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <HeroSection searchParams={searchParams} />
            </Suspense>
            <BenefitsSection />
            <IntegrationsSection />
            <AvatarBookSection />
            <PricingSection />
            <Footer />
        </main>
    );
}
