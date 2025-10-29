'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { industryPricing } from '@/config/for-industry/industryPricing';
import type { string_book } from '@promptbook/types';
import { Suspense } from 'react';
import { industryBenefits } from '../../config/for-industry/industryBenefits';

function ForIndustryPageContent() {
    // Note: The book is not loaded in this client component.
    // If it's needed, it should be passed as a prop from a server component.
    const engineeringBook = `
      # Engineering Manual

      ...
    ` as string_book;

    return (
        <>
            <BusinessGetStartedModal placeName="ForIndustryPage" />
            <main className="min-h-screen">
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <HeroSection initialBook={engineeringBook} />
                </Suspense>
                <BenefitsSection
                    title="AI-Powered Solutions for the Engineering Industry"
                    description="Streamline operations, reduce downtime, and enhance support with AI agents tailored for your industrial needs."
                    benefits={industryBenefits}
                />
                <IntegrationsSection />
                {/* <AvatarBookSection /> */}
                <TestimonialsSection />
                <PricingSection plans={industryPricing} />
                <Footer />
            </main>
        </>
    );
}

export default function ForIndustryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForIndustryPageContent />
        </Suspense>
    );
}
