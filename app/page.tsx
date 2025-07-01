import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { Suspense } from 'react';

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
