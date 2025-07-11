import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PricingSection } from '@/components/pricing-section';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
    return {
        title: 'Pricing – Promptbook',
        description: 'Simple, transparent pricing for your AI avatar. Start free and scale as you grow.',
    };
}

export default function PricingPage() {
    return (
        <main className="min-h-screen">
            <Header />
            <PricingSection />
            <Footer />
        </main>
    );
}
