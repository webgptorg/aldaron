'use client';

import { EnemySection } from '@/components/enemy-section';
import { FAQSection } from '@/components/faq-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Header } from '@/components/header';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { MinimalFooter } from '@/components/minimal-footer';
import { PainPointsSection } from '@/components/pain-points-section';
import { QualificationPopup } from '@/components/qualification-popup';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { SolutionSection } from '@/components/solution-section';
import { ProFirmyHeroSection } from '@/config/pro-firmy/proFirmyHero';
import { ProFirmyTestimonialsSection } from '@/config/pro-firmy/proFirmyTestimonials';
import { Suspense } from 'react';

export function ProFirmyPage() {
    return (
        <>
            <Suspense>
                <QualificationPopup placeName="ProFirmyPage" />
            </Suspense>
            <main className="min-h-screen">
                <Header
                    fomoText={
                        <>
                            <span>🔥</span>
                            <span>
                                Zbývá <strong className="text-gray-900">7 míst z 10</strong> pro strategický hovor
                                zdarma
                            </span>
                        </>
                    }
                    getStartedText="Zarezervovat hovor zdarma"
                    ctaShortText="Rezervovat"
                />
                <Suspense fallback={<div>Načítání...</div>}>
                    <ProFirmyHeroSection />
                </Suspense>
                <SocialProofStrip />
                <PainPointsSection />
                <SolutionSection />
                <HowItWorksSection />
                <EnemySection />
                <ProFirmyTestimonialsSection />
                <FAQSection />
                <FinalCTASection />
                <MinimalFooter />
            </main>
        </>
    );
}
