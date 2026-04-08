import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { PainPointsSection } from '@/components/pain-points-section';
import { SolutionSection } from '@/components/solution-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { EnemySection } from '@/components/enemy-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { FAQSection } from '@/components/faq-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { MinimalFooter } from '@/components/minimal-footer';
import { QualificationPopup } from '@/components/qualification-popup';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Force static generation for static export
export const dynamic = 'force-static';

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
                <HeroSection />
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
