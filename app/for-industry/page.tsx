'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { IntegrationsSection } from '@/components/integrations-section';
import { OldHeroSection } from '@/components/old-hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TryItYourselfSection } from '@/components/try-it-yourself-section';
import { Button } from '@/components/ui/button';
import forIndustryBook from '@/config/for-industry/for-industry.book';
import { industryIntegrations } from '@/config/for-industry/industryIntegrations';
import { industryPricing } from '@/config/for-industry/industryPricing';
import { industryTestimonials } from '@/config/for-industry/industryTestimonials';
import { citiesCsConversation } from '@/config/pro-mesta/citiesCsConversation';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { industryBenefits } from '../../config/for-industry/industryBenefits';

export default function ForIndustryPage() {
    const isLocalhost = useIsLocalhost();
    return (
        <>
            <Suspense>
                <BusinessGetStartedModal placeName="ForIndustryPage" />
            </Suspense>
            <main className="min-h-screen">
                <Header />
                <Suspense>
                    <OldHeroSection
                        conversation={citiesCsConversation /* <- TODO: !!! Change */}
                        backgroundImage="/backgrounds/for-industry.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Transformation for {you || 'the industry'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Create AI that{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            Truly&nbsp;Understands
                                        </span>{' '}
                                        {you || <>The Industry</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        With Promptbook, you can capture your company's context, rules, and knowledge
                                        into simple <b>Books</b> to build AI agents that align perfectly with your
                                        business needs.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Get Started {you ? <>with AI in {you}</> : <>with Promptbook AI</>}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Open Source
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Your Data, Your Control
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Easy Setup
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>
                <Suspense>
                    <TryItYourselfSection initialBook={forIndustryBook} />
                </Suspense>
                <BenefitsSection
                    title="AI-Powered Solutions for the Engineering Industry"
                    description="Streamline operations, reduce downtime, and enhance support with AI agents tailored for your industrial needs."
                    benefits={industryBenefits}
                />
                <IntegrationsSection integrations={industryIntegrations} />
                <TestimonialsSection testimonials={industryTestimonials} />
                <TeamSection />
                <PricingSection plans={industryPricing} />
                {isLocalhost && <PlaygroundSection />}
                <Footer />
            </main>
        </>
    );
}
