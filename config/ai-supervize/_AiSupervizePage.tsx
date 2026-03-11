'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import { aiSupervizeBenefits } from '@/config/ai-supervize/aiSupervizeBenefits';
import {
    aiSupervizeDeliverables,
    aiSupervizeFocusAreas,
    aiSupervizeProcess,
    aiSupervizeSecurity,
    aiSupervizeSituations,
    aiSupervizeSituationsNote,
    aiSupervizeSymptoms,
} from '@/config/ai-supervize/aiSupervizeContent';
import { aiSupervizeConversation } from '@/config/ai-supervize/aiSupervizeConversation';
import { aiSupervizePricing, aiSupervizePricingFootnotes } from '@/config/ai-supervize/aiSupervizePricing';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
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
                    title="Domluvme si AI Supervizi pro váš tým"
                    requestSent="Poptávka odeslána!"
                    specialistContact="Ozveme se vám co nejdříve s návrhem dalšího kroku."
                    ceoOf="CEO AI Web s.r.o."
                    description="Stačí e-mail nebo telefon. Během krátkého discovery workshopu zjistíte, jestli AI Supervize vašemu týmu skutečně přinese hodnotu."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Domluvit workshop"
                />
            </Suspense>

            <main className="min-h-screen bg-white">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Přínosy"
                    integrationsText="Výstupy"
                    pricingText="Ceník"
                    getStartedText="Domluvit workshop"
                />

                <Suspense>
                    <HeroSection
                        conversation={aiSupervizeConversation}
                        backgroundImage="/backgrounds/ai-supervize.svg"
                        getHero={() => (
                            <>
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                        <BookOpen className="h-4 w-4" />
                                        AI Supervize pro software týmy
                                    </div>

                                    <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                                        Zaveďte AI do vývoje jako{' '}
                                        <span className="bg-gradient-to-r from-cyan-300 via-white to-amber-200 bg-clip-text text-transparent">
                                            kontrolovaný výkon
                                        </span>
                                        , ne náhodnou loterii
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-white/85">
                                        Pomáháme CTO, CEO a Tech Leadům nastavit workflow, pravidla, nástroje a měření
                                        tak, aby AI zkracovala time-to-merge, snižovala rework a nezvyšovala chaos.
                                    </p>

                                    <div className="rounded-3xl border border-white/15 bg-white/8 p-5 text-white/90 shadow-2xl backdrop-blur-sm">
                                        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Výsledek</p>
                                        <p className="mt-3 text-lg leading-relaxed">
                                            Není to přednáška o AI. Je to{' '}
                                            <strong>rozhodnutí + plán + playbook + šablony + měřitelné metriky</strong>{' '}
                                            pro váš konkrétní produkt a tým.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="rounded-full bg-white px-8 py-6 text-lg text-slate-950 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/95"
                                        >
                                            Domluvit discovery workshop
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm text-white/80 backdrop-blur-sm">
                                        Full-Stack / TypeScript / JavaScript / Next.js i další stacky
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-white/75">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        NDA a pravidla pro data
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Playbook a šablony do repa
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Měřitelný dopad do 30 / 60 / 90 dní
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

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
                    description="Spolupráce je navržená tak, aby vedla k rozhodnutí, zavedení i průběžnému vyhodnocování, ne jen k jednorázovému workshopu."
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
                    title="Ceník AI Supervize"
                    description="Začít můžete discovery workshopem. Pokud dává smysl pokračovat, navážeme návrhem, nastavením a případným follow-up režimem."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    showBillingToggle={false}
                    openSourceGuaranteeText="Nezačínáte nákupem dalšího AI toolu. Začínáte rozhodnutím, kde má AI ve vašem vývoji skutečně fungovat."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
