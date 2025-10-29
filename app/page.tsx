'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { defaultPricing } from '@/config/pricing';
import { TestimonialsSection } from '@/components/testimonials-section';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomePageContent() {
    const searchParams = useSearchParams();


    return (
        <>
            <WaitlistPopup
                placeName="HomePage"
            />
            <main className="min-h-screen">
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <HeroSection />
                </Suspense>
                <BenefitsSection />
                <IntegrationsSection />
                {/* <AvatarBookSection /> */}
                <TestimonialsSection />
                <TeamSection />
                <PricingSection plans={defaultPricing} />
                <Footer />
            </main>
        </>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePageContent />
        </Suspense>
    );
}
