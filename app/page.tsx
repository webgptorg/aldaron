'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TryItYourselfSection } from '@/components/try-it-yourself-section';
import { Button } from '@/components/ui/button';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { defaultPricing } from '@/config/_generic/defaultPricing';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function HomePage() {
    return (
        <>
            <Suspense>
                <WaitlistPopup placeName="HomePage" />
            </Suspense>
            <main className="min-h-screen">
                <Header />
                <Suspense>
                    <HeroSection
                        getHero={({ you }) => (
                            <>
                                {' '}
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-gray-900">
                                        <BookOpen className="w-4 h-4" />
                                        {`AI Transformation for  ${you || 'Your business'}`}
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                        Create AI that{' '}
                                        <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">
                                            Truly&nbsp;Understands
                                        </span>{' '}
                                        {you || <>Your Company</>}
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed">
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
                                <div className="flex items-center gap-8 text-sm text-gray-500">
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
                <Suspense>
                    <TryItYourselfSection />
                </Suspense>
                <BenefitsSection />
                <IntegrationsSection />
                <TestimonialsSection />
                <TeamSection />
                <PricingSection plans={defaultPricing} />
                <Footer />
            </main>
        </>
    );
}
