'use client'; // <- TODO: !!! Maybe not ideal here

import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TryItYourselfSection } from '@/components/try-it-yourself-section';
import { Button } from '@/components/ui/button';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { defaultPricing } from '@/config/_generic/defaultPricing';
import { genericConversation } from '@/config/_generic/genericConversation';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
// import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

/*
TODO: !!! Use
export const metadata: Metadata = {
    title: 'Promptbook - Create AI that Truly Understands Your Business',
    description:
        "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Promptbook - Create AI that Truly Understands Your Business',
        description:
            "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
        url: 'https://ptbk.io',
    },
    twitter: {
        title: 'Promptbook - Create AI that Truly Understands Your Business',
        description:
            "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    },
};
*/

export function HomePageComponent() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <WaitlistPopup placeName="HomePage" />
            </Suspense>
            <main className="min-h-screen">
                <Header />
                <Suspense>
                    <HeroSection
                        conversation={genericConversation}
                        getHero={({ you }) => (
                            <>
                                {' '}
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-gray-900">
                                        <BookOpen className="w-4 h-4" />
                                        {`AI Transformation for  ${you || 'Your business'}`}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                        Create AI that{' '}
                                        <span className="bg-promptbook-blue-dark bg-clip-text text-transparent">
                                            Truly&nbsp;Understands
                                        </span>{' '}
                                        {you || <>Your Company</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
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
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Open Source
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Your Data, Your Control
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Easy Setup
                                    </div>
                                </div>
                                {/* Powered by Promptbook */}
                                {/*
                                <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element * /}
                                    <img src="/logo/promptbook-logo-blue-256.png" alt="Promptbook" className="w-6 h-6" />
                                    <div className="text-sm">
                                        <span className="text-gray-600">Powered by </span>
                                        <Link
                                            href="https://www.ptbk.io"
                                            className="font-semibold text-promptbook-blue hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Promptbook
                                        </Link>
                                        <span className="text-gray-500 ml-2">• Truly Your AI{you && <>, {you}</>}</span>
                                    </div>
                                </div>
                                */}
                            </>
                        )}
                    />
                </Suspense>
                {/*
                <Suspense>
                    <TryItYourselfSection />
                </Suspense>
                */}
                <BenefitsSection />
                <IntegrationsSection />
                <TestimonialsSection />
                <PricingSection plans={defaultPricing} />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection />
                <Footer />
            </main>
        </>
    );
}

/**
 * TODO: !!! Zig-zag the bg of the sections
 */
