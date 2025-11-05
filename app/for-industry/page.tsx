'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
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
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { industryBenefits } from '../../config/for-industry/industryBenefits';
import { PlaygroundSection } from '@/components/playground-section';

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
                    <HeroSection
                        conversation={citiesCsConversation /* <- TODO: !!! Change */}
                        backgroundImage="/backgrounds/for-industry.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Transformation for {you || 'the industry'}
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                        Create AI that{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            Truly&nbsp;Understands
                                        </span>{' '}
                                        {you || <>The Industry</>}
                                    </h1>
                                    <p className="text-xl text-white leading-relaxed">
                                        With Promptbook, you can capture your company's context, rules, and knowledge
                                        into simple <b>Books</b> to build AI agents that align perfectly with your
                                        business needs.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                    >
                                        Get Started {you ? <>with AI in {you}</> : <>with Promptbook AI</>}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex items-center gap-8 text-sm opacity-80">
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
