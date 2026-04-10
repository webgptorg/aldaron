import { EnemySection } from '@/components/enemy-section';
import { FAQSection } from '@/components/faq-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Header } from '@/components/header';
import { HeroSectionProFirmy } from '@/components/hero-section-pro-firmy';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { MinimalFooter } from '@/components/minimal-footer';
import { PainPointsSection } from '@/components/pain-points-section';
import { QualificationPopup } from '@/components/qualification-popup';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { SolutionSection } from '@/components/solution-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Metadata } from 'next';
import { Suspense } from 'react';

// !!!! Keep or remove> export const metadata: Metadata = defaultMetadata;

export function generateMetadata(): Metadata {
    return {
        title: 'Promptbook — Okamžitý přístup ke všemu, co vaše firma kdy napsala',
        description:
            'Nahrajte firemní dokumenty, vytvořte virtuálního zaměstnance a ptejte se normální češtinou. Bez promptů, bez halucinací, 100% GDPR. Česká AI platforma.',
    };
}

export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />
            <Suspense fallback={<div>Načítání...</div>}>
                <HeroSectionProFirmy />
            </Suspense>
            <SocialProofStrip />
            <PainPointsSection />
            <SolutionSection />
            <HowItWorksSection />
            <EnemySection />
            <TestimonialsSection />
            <FAQSection />
            <FinalCTASection />
            <MinimalFooter />
            <QualificationPopup />
        </main>
    );
}
