'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { AiSupervizeTerminal } from '@/businesses/ai-supervize/AiSupervizeTerminal';
import { aiSupervizeBenefits } from '@/businesses/ai-supervize/aiSupervizeBenefits';
import {
    aiSupervizeDeliverables,
    aiSupervizeFocusAreas,
    aiSupervizeProcess,
    aiSupervizeSecurity,
    aiSupervizeSituations,
    aiSupervizeSituationsNote,
    aiSupervizeSymptoms,
} from '@/businesses/ai-supervize/aiSupervizeContent';
import { aiSupervizePricing, aiSupervizePricingFootnotes } from '@/businesses/ai-supervize/aiSupervizePricing';
import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function AiSupervizePage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="AiSupervizePage"
                    title="Domluvme první krok k AI Supervizi"
                    requestSent="Poptávka odeslána!"
                    specialistContact="Ozveme se vám brzy a navrhneme další krok."
                    ceoOf="CEO AI Web s.r.o."
                    description="Stačí e-mail nebo telefon. Společně vybereme, jestli se pro váš tým hodí školení ve firmě, online workshop, nebo discovery s CTO či Tech Leadem."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Něco se pokazilo. Zkuste to prosím znovu."
                    sending="Odesíláme..."
                    scheduleCall="Domluvit první krok"
                />
            </Suspense>

            <main className="min-h-screen bg-white">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Přínosy"
                    integrationsText="Výstupy"
                    pricingText="Ceník"
                    getStartedText="Domluvit první krok"
                    primaryAction={{ label: 'Domluvit první krok', href: '?modal=get-started', mobileLabel: 'Domluvit' }}
                    secondaryAction={{ label: 'Pro jednotlivce', href: '/ai-supervize-mini' }}
                />

                {/* ── Hero Section ── */}
                <section
                    id="hero"
                    className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
                    style={{
                        backgroundImage: `url(/backgrounds/ai-supervize.svg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: '50% 100%',
                    }}
                >
                    <div className="container mx-auto relative z-10 overflow-hidden px-4 py-20 text-white">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column – copy */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="min-w-0 space-y-8"
                            >
                                <div className="space-y-5">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                        <BookOpen className="h-4 w-4" />
                                        AI Supervize pro software týmy
                                    </div>

                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Zaveďte AI do vývoje jako{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            řízený proces
                                        </span>
                                        , ne náhodnou loterii
                                    </h1>

                                    <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                        Pomůžeme vám nastavit workflow, pravidla, nástroje a měření. AI pak může vývoj
                                        zrychlit, místo aby do něj přinesla další chaos a riziko.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        >
                                            Domluvit první krok
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/ai-supervize-mini">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                                        >
                                            Pro jednotlivce
                                        </Button>
                                    </Link>
                                    <div className="w-fit max-w-full rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm text-white/80 backdrop-blur-sm">
                                        Pro týmy s TypeScriptem a Next.js
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-white/75 sm:gap-5">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        NDA a pravidla pro práci s daty
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Playbook a pravidla pro tým
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Měřitelný dopad{/* do 30 / 60 / 90 dní */}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Column – terminal chart */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="min-w-0"
                            >
                                <AiSupervizeTerminal />
                            </motion.div>
                        </div>
                    </div>
                </section>

                <BenefitsSection
                    title="Co se ve vašem týmu změní"
                    description="Nastavíme systém, ve kterém AI pomáhá doručovat software rychleji a bezpečněji."
                    benefits={aiSupervizeBenefits}
                />

                <FeatureCardsSection
                    title="Dvě situace, se kterými za námi chodíte nejčastěji"
                    description="Můžete teprve začínat, nebo už AI používáte a narážíte na její limity. Postup přizpůsobíme tomu, kde právě jste."
                    note={aiSupervizeSituationsNote}
                    cards={aiSupervizeSituations}
                    columns={2}
                    tone="white"
                />

                <FeatureCardsSection
                    title="Když AI ve vývoji začíná dělat potíže"
                    description="Tyhle signály říkají, že AI potřebuje dohled, workflow a jasná pravidla."
                    cards={aiSupervizeSymptoms}
                    columns={4}
                    tone="contrast"
                />

                <FeatureCardsSection
                    id="integrations"
                    title="Co vám po AI Supervizi zůstane"
                    description="Dostanete konkrétní výstupy, které může tým hned používat a podle kterých lze zavádění AI řídit."
                    cards={aiSupervizeDeliverables}
                    columns={3}
                    tone="muted"
                />

                <FeatureCardsSection
                    title="Na co se podíváme"
                    description="Projdeme místa, kde AI ovlivňuje vývojový proces, kvalitu kódu a rychlost delivery."
                    cards={aiSupervizeFocusAreas}
                    columns={3}
                    tone="white"
                />

                <FeatureCardsSection
                    title="Jak budeme postupovat"
                    description="Začít můžeme školením ve firmě, online workshopem nebo discovery blokem. Pak navážeme konkrétní AI Supervizí a případným follow-upem."
                    cards={aiSupervizeProcess}
                    columns={3}
                    tone="muted"
                />

                <FeatureCardsSection
                    title="Bezpečnost řešíme od začátku"
                    description="Práce s citlivými daty a kontrola workflow patří do návrhu od prvního dne."
                    cards={aiSupervizeSecurity}
                    columns={3}
                    tone="contrast"
                />

                {/*
                <TestimonialsSection
                    title="Co o Promptbooku říkají"
                    description="Přístup, na kterém stojí AI Supervize, už pomáhá propojovat technologie, lidi a reálné firemní workflow."
                    testimonials={aiSupervizeTestimonials}
                />
                */}

                <TeamSection
                    title="Kdo s vámi bude pracovat"
                    description={
                        <>
                            AI Supervizi vede tým <strong>AI Web s.r.o.</strong>. <strong>Promptbook</strong> je náš
                            produkt pro zavádění AI do reálných organizací. Zkušenosti z jeho vývoje a každodenního
                            používání AI ve vývoji přenášíme do workflow, pravidel a metrik pro klientské týmy.
                        </>
                    }
                    jiriDescription={
                        <>
                            Jiří spojuje výzkumnou přesnost s produktem a vedením týmu. Má Ph.D. z matematiky a
                            zkušenost z <Link href="https://www.it4i.cz/">IT4Innovations</Link>. Hlídá proto metodiku,
                            měření i technická rozhodnutí.
                        </>
                    }
                    pavolDescription={
                        <>
                            Pavol je developer s 15+ lety praxe a aktivně přispívá do{' '}
                            <Link href="https://www.pavolhejny.com/">open source</Link>. Do AI Supervize přináší
                            pohled člověka, který každý den řeší vývoj, code review, tooling i kvalitu změn.
                        </>
                    }
                />

                <PricingSection
                    title="Jak můžeme začít"
                    description="Začít můžete školením ve firmě, online workshopem nebo discovery workshopem. Když pak navážete AI Supervizí, cenu prvního kroku odečteme z balíčku 80 000 Kč."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    showBillingToggle={false}
                    stepsMode={true}
                    stepsGroups={[[0, 1, 2], [3], [4]]}
                    stepsGroupLabels={['Začátek', 'AI Supervize', 'Průběžná péče']}
                    stepsGroupTransitions={[
                        'Vybereme první krok, který vašemu týmu dává smysl. Jeho cenu pak odečteme z balíčku AI Supervize.',
                        'Až budou pravidla, playbook a šablony fungovat v praxi, můžete pokračovat měsíčním follow-upem.',
                    ]}
                    openSourceGuaranteeText="Nejdřív si ujasníme, co váš tým potřebuje. Teprve potom vybereme první krok."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
