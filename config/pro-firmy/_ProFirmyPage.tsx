'use client';

import { BookingNotification } from '@/components/booking-notification';
import { EnemySection } from '@/components/enemy-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { PainPointsSection } from '@/components/pain-points-section';
import { QualificationPopup } from '@/components/qualification-popup';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { SolutionSection } from '@/components/solution-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Suspense } from 'react';

export function ProFirmyPage() {
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
            <TeamSection />
            <FinalCTASection />
            <Footer />
            {/* <- Note: Due to legal reasons we cannot use `<MinimalFooter/>` here and need to use `<Footer/>` instead
                         On the other hand, we can use `<MinimalFooter/>` on the `/dekujeme` page 
            */}
            <QualificationPopup />
            <BookingNotification />
        </main>
    );
}
