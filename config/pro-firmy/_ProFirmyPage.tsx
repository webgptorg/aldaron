'use client';

import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { EnemySection } from '@/components/enemy-section';
import { FAQSection } from '@/components/faq-section';
import { FinalCTASection } from '@/components/final-cta-section';
import { Header } from '@/components/header';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { MinimalFooter } from '@/components/minimal-footer';
import { PainPointsSection } from '@/components/pain-points-section';
import { SocialProofStrip } from '@/components/social-proof-strip';
import { SolutionSection } from '@/components/solution-section';
import { ProFirmyHeroSection } from '@/config/pro-firmy/proFirmyHero';
import { Suspense } from 'react';

export function ProFirmyPage() {
    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ProFirmyPage"
                    title="Jste připraveni posunout svou firmu s AI?"
                    requestSent="Požadavek odeslán!"
                    specialistContact="Náš specialista vás bude brzy kontaktovat."
                    ceoOf="CEO společnosti Promptbook"
                    description="Naplánujte si bezplatný a nezávazný 20minutový strategický hovor. Projdeme vaši situaci a ukážeme vám Promptbook přímo na vašich firemních datech."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo"
                    sending="Odesílání..."
                    scheduleCall="Zarezervovat hovor zdarma"
                    genericErrorMessage="Došlo k chybě"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header isBare />
                <Suspense fallback={<div>Načítání...</div>}>
                    <ProFirmyHeroSection />
                </Suspense>
                <SocialProofStrip />
                <PainPointsSection />
                <SolutionSection />
                <HowItWorksSection />
                <EnemySection />
                <FAQSection />
                <FinalCTASection />
                <MinimalFooter />
            </main>
        </>
    );
}
