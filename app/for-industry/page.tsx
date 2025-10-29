'use client';

import { Benefit, BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { industryPricing } from '@/config/pricing';
import type { string_book } from '@promptbook/types';
import { Suspense } from 'react';

const industryBenefits: Benefit[] = [
    {
        iconName: 'Briefcase',
        title: 'Instant Access to Technical Knowledge',
        description: 'Provide field technicians and support staff with immediate access to relevant information from technical manuals and SOPs.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        iconName: 'Zap',
        title: 'Reduce Equipment Downtime',
        description: 'Minimize downtime by empowering your team with AI-driven troubleshooting guides and maintenance procedures.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        iconName: 'Shield',
        title: 'Enhance Technical Support',
        description: 'Build AI-powered support bots that can answer complex technical questions and guide users through repairs.',
        gradient: 'from-purple-500 to-pink-500',
    },
];

function ForIndustryPageContent() {
   

    // Note: The book is not loaded in this client component.
    // If it's needed, it should be passed as a prop from a server component.
    const engineeringBook = `
      # Engineering Manual

      ...
    ` as string_book;

    return (
        <>
            <BusinessGetStartedModal
                placeName="ForIndustryPage"
            />
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
