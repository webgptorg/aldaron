'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import forIndustryBook from '@/config/for-industry/for-industry.book';
import { industryIntegrations } from '@/config/for-industry/industryIntegrations';
import { industryPricing } from '@/config/for-industry/industryPricing';
import { industryTestimonials } from '@/config/for-industry/industryTestimonials';
import { Suspense } from 'react';
import { industryBenefits } from '../../config/for-industry/industryBenefits';

function ForIndustryPageContent() {
    return (
        <>
            <BusinessGetStartedModal placeName="ForIndustryPage" />
            <main className="min-h-screen">
                <Header />
                <Suspense fallback={<div>Loading...</div>}>
                    <HeroSection
                        initialBook={forIndustryBook}
                        getHeroText={({ you }) => `AI Transformation for ${you || 'the industry'}`}
                        getHeadingText={({ you }) => (
                            <>
                                Create AI that{' '}
                                <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">
                                    Truly&nbsp;Understand
                                </span>{' '}
                                {you || <>The Industry</>}
                            </>
                        )}
                    />
                </Suspense>
                <BenefitsSection
                    title="AI-Powered Solutions for the Engineering Industry"
                    description="Streamline operations, reduce downtime, and enhance support with AI agents tailored for your industrial needs."
                    benefits={industryBenefits}
                />
                <IntegrationsSection integrations={industryIntegrations} />
                <TestimonialsSection testimonials={industryTestimonials} />
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
