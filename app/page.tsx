import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { Metadata } from 'next';
import { Suspense } from 'react';

type Props = {
    searchParams: { [key: string]: string | string[] | undefined };
};

export function generateMetadata({ searchParams }: Props): Metadata {
    // Get the 'you' parameter from URL (both regular and ROT13 encoded)
    const youParam = searchParams.you as string;
    const youRot13Param = searchParams.lbh as string; // 'you' in ROT13

    // Decode the parameter - use regular 'you' if available, otherwise decode ROT13 'lbh'
    const you = youParam || (youRot13Param ? rot13(youRot13Param) : null);

    if (you) {
        const You = you.charAt(0).toUpperCase() + you.slice(1);
        return {
            title: `✨ ${You}, make AI that Thinks Like You`,
            description: 'Reclaim Your Time with AI That Thinks Like You ✨ Powered by Promptbook',
        };
    }

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

export default function Home() {
    console.log('Home page rendered');

    return (
        <main className="min-h-screen">
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <HeroSection />
            </Suspense>
            <BenefitsSection />
            <IntegrationsSection />
            <PricingSection />
            <Footer />
        </main>
    );
}
