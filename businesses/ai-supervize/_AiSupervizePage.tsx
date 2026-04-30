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
                    specialistContact="Ozveme se vám co nejdříve s návrhem dalšího kroku."
                    ceoOf="CEO AI Web s.r.o."
                    description="Stačí e-mail nebo telefon. Vybereme, jestli je pro váš tým nejlepší školení ve firmě, online workshop, nebo discovery s CTO či Tech Leadem."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
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
                                            kontrolovaný výkon
                                        </span>
                                        , ne náhodnou loterii
                                    </h1>

                                    <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                        Pomáháme firmám nastavit workflow, pravidla, nástroje a měření tak, aby AI
                                        opravdu pomáhala při vývoji software, místo aby přidávala chaos a riziko.
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
                                        Ideální pro TypeScript / Next.js týmy
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-white/75 sm:gap-5">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        NDA a pravidla pro data
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Playbook a konkrétní pravidla
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
                    title="Co má AI Supervize změnit ve vašem týmu"
                    description="AI Supervize není o tom přidat další nástroj. Je o tom nastavit systém, ve kterém AI pomáhá rychleji a bezpečněji doručovat software."
                    benefits={aiSupervizeBenefits}
                />

                <FeatureCardsSection
                    title="Dvě typické situace, se kterými přicházíte"
                    description="Ať už jste na začátku, nebo už AI používáte a narážíte na limity, postup přizpůsobíme vaší výchozí situaci."
                    note={aiSupervizeSituationsNote}
                    cards={aiSupervizeSituations}
                    columns={2}
                    tone="white"
                />

                <FeatureCardsSection
                    title="Typické symptomy, které řešíme"
                    description="Toto jsou signály, že AI ve vývoji potřebuje dohled, workflow a jasná pravidla."
                    cards={aiSupervizeSymptoms}
                    columns={4}
                    tone="contrast"
                />

                <FeatureCardsSection
                    id="integrations"
                    title="Co dostanete po AI Supervizi"
                    description="Odcházíte s konkrétními výstupy, které může tým hned používat a podle kterých lze zavádění AI reálně řídit."
                    cards={aiSupervizeDeliverables}
                    columns={3}
                    tone="muted"
                />

                <FeatureCardsSection
                    title="Na co se u vás díváme prakticky"
                    description="Neřešíme AI v abstrakci. Jdeme po konkrétních místech, kde ovlivňuje vývojový proces, kvalitu kódu a rychlost delivery."
                    cards={aiSupervizeFocusAreas}
                    columns={3}
                    tone="white"
                />

                <FeatureCardsSection
                    title="Jak AI Supervize probíhá"
                    description="Spolupráce může začít školením ve firmě, online workshopem nebo discovery blokem a pak pokračuje do konkrétní AI Supervize i follow-upu."
                    cards={aiSupervizeProcess}
                    columns={3}
                    tone="muted"
                />

                <FeatureCardsSection
                    title="Bezpečnost a důvěrnost"
                    description="Citlivá data a kontrola nad workflow jsou součástí návrhu od prvního dne."
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
                    title="Kdo vás provede"
                    description={
                        <>
                            AI Supervizi vede tým <strong>AI Web s.r.o.</strong>. <strong>Promptbook</strong> je náš
                            produkt pro zavádění AI do reálných organizací a zkušenosti z jeho vývoje i každodenního
                            používání AI v software delivery přenášíme přímo do workflow, pravidel a metrik, které
                            nastavujeme klientským týmům.
                        </>
                    }
                    jiriDescription={
                        <>
                            Jiří propojuje výzkumnou preciznost s produktem a vedením týmu. Má Ph.D. z matematiky a
                            zkušenost z <Link href="https://www.it4i.cz/">IT4Innovations</Link>, takže umí držet
                            metodiku, měření a technické rozhodování v jedné linii.
                        </>
                    }
                    pavolDescription={
                        <>
                            Pavol je developer s 15+ lety praxe a aktivní{' '}
                            <Link href="https://www.pavolhejny.com/">open-source contributor</Link>. Do AI Supervize
                            přináší pohled člověka, který denně řeší reálný vývoj, code review, tooling i kvalitu změn.
                        </>
                    }
                />

                <PricingSection
                    title="Možnosti startu a další spolupráce"
                    description="Začít můžete školením ve firmě, online workshopem nebo discovery workshopem. Pokud pak navážete AI Supervizí, cenu prvního kroku odečteme z balíčku 80 000 Kč."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    showBillingToggle={false}
                    stepsMode={true}
                    stepsGroups={[[0, 1, 2], [3], [4]]}
                    stepsGroupLabels={['Start AI Supervize', 'AI Supervize', 'Follow-up']}
                    stepsGroupTransitions={[
                        'Zvolíme nejvhodnější vstup pro váš tým. Pokud navážete AI Supervizí, cenu prvního kroku odečteme z balíčku.',
                        'Jakmile jsou pravidla, playbook a šablony zavedené, můžete pokračovat lehčím měsíčním follow-upem.',
                    ]}
                    openSourceGuaranteeText="Nezačínáte nákupem dalšího AI toolu. Začínáte rozhodnutím, jaký první krok dává vašemu týmu největší smysl."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
