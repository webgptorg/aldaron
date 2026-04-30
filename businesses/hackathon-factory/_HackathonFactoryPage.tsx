'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import {
    hackathonFactoryAudience,
    hackathonFactoryHighlights,
    hackathonFactoryPrinciples,
    hackathonFactoryPrinciplesNote,
    hackathonFactoryProcess,
    hackathonFactoryProcessNote,
    hackathonFactorySituations,
} from '@/businesses/hackathon-factory/hackathonFactoryContent';
import { hackathonFactoryConversation } from '@/businesses/hackathon-factory/hackathonFactoryConversation';
import {
    hackathonFactoryPricing,
    hackathonFactoryPricingFootnotes,
} from '@/businesses/hackathon-factory/hackathonFactoryPricing';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { HackathonFactoryLogo } from '@/components/hackathon-factory-logo';
import { Header } from '@/components/header';
import { OldHeroSection } from '@/components/old-hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function HackathonFactoryPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="HackathonFactoryPage"
                    title="Řekněte nám svůj problém nebo zájem o účast"
                    requestSent="Děkujeme, ozveme se."
                    specialistContact="Do 24 hodin vám napíšeme s návrhem dalšího kroku."
                    ceoOf="CEO AI Web s.r.o."
                    description="Stačí e-mail nebo telefon. Napište, co chcete na hackathonu řešit, nebo že se chcete zapojit jako účastník."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Ozvat se nám"
                />
            </Suspense>

            <main className="min-h-screen bg-white">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Jak to funguje"
                    integrationsText="Pro koho"
                    pricingText="Zapojení"
                    getStartedText="Ozvat se"
                    brandLogo={
                        <HackathonFactoryLogo
                            showWordmark={false}
                            className="gap-0"
                            markClassName="h-8 w-8 text-slate-900"
                        />
                    }
                    brandName={
                        <span className="text-xl font-bold text-gray-900">
                            Hackathon <span className="text-slate-900">Factory</span>
                        </span>
                    }
                />

                <Suspense>
                    <OldHeroSection
                        conversation={hackathonFactoryConversation}
                        backgroundImage={null}
                        getHero={() => (
                            <>
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                                        <HackathonFactoryLogo
                                            showWordmark={false}
                                            className="gap-0"
                                            markClassName="h-7 w-7 text-slate-800"
                                        />
                                        Hackathon Factory – tržiště pro reálné problémy a buildery
                                    </div>

                                    <h1 className="text-5xl font-bold leading-tight text-slate-900 lg:text-6xl">
                                        Spojujeme <span className="text-amber-500">reálné problémy</span> s týmy, které
                                        je umí dotáhnout do výsledku
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-slate-600">
                                        Krátké hackathon sprinty pro CTO, zakladatele startupů, inovátory i developery.
                                        Cílem není hackovat pro hackování, ale dodat funkční prototyp, rozhodnutí nebo
                                        plán, který použijete hned další den.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="bg-slate-900 text-white hover:bg-slate-700 text-lg px-8 py-6 rounded-full"
                                        >
                                            Přihlásit problém nebo zájem
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                                        Ozveme se do 24 hodin
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        1-2 dny intenzivního sprintu
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        Online i prezenčně
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-amber-500" />
                                        Prototyp, rozhodnutí nebo plán
                                    </div>
                                </div>

                                <div className="max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
                                    <p className="font-semibold text-slate-900">Nejde o soutěž pro efekt.</p>
                                    <p className="mt-2">
                                        Každý sprint stojí na zadání z praxe. Žádné umělé výzvy, žádné teoretické
                                        scénáře - jen skutečné problémy, skutečná řešení a skutečný dopad.
                                    </p>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <section className="relative z-10 -mt-12 px-4 pb-8">
                    <div className="container mx-auto">
                        <div className="grid gap-4 md:grid-cols-3">
                            {hackathonFactoryHighlights.map((highlight, index) => (
                                <motion.div
                                    key={highlight.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                                        {highlight.label}
                                    </div>
                                    <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                                        {highlight.value}
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                        {highlight.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <FeatureCardsSection
                    id="benefits"
                    title="Jak Hackathon Factory funguje"
                    description="Zadání nejdřív zpřesníme, během sprintu ho týmy řeší v reálném čase a po hackathonu můžete rovnou navázat další spolupráci."
                    note={hackathonFactoryProcessNote}
                    cards={hackathonFactoryProcess}
                    columns={3}
                    tone="muted"
                    className="pt-12"
                />

                <FeatureCardsSection
                    id="integrations"
                    title="Pro koho je Hackathon Factory"
                    description="Potkávají se tu lidé s konkrétním problémem a lidé, kteří chtějí opravdu stavět. Obojí je stejně důležité."
                    cards={hackathonFactoryAudience}
                    columns={2}
                    tone="white"
                />

                <FeatureCardsSection
                    title="Typické situace, se kterými k nám přicházíte"
                    description="Když potřebujete rychle ověřit hypotézu, rozhodnout se kudy dál nebo najít tým pro další krok."
                    cards={hackathonFactorySituations}
                    columns={3}
                    tone="contrast"
                />

                <FeatureCardsSection
                    title="Proč to nebude hackathon bez výsledku"
                    description="Každé zadání filtrujeme podle toho, jestli může vést k použitelnému dopadu i po skončení akce."
                    note={hackathonFactoryPrinciplesNote}
                    cards={hackathonFactoryPrinciples}
                    columns={3}
                    tone="muted"
                />

                <TeamSection
                    title="Kdo za tím stojí"
                    description={
                        <>
                            Za Hackathon Factory stojí <strong>AI Web s.r.o.</strong> - Jiří Jahn a Pavol Hejný.
                            <strong> Promptbook</strong> je naše platforma pro nasazování AI agentů v reálném provozu
                            pro obce, univerzity a firmy, takže dobře víme, co je použitelné řešení a co je jen
                            technologický hype. Hackathon Factory stavíme proto, že nejlepší způsob, jak pochopit novou
                            technologii, je použít ji na skutečný problém.
                        </>
                    }
                    jiriDescription={
                        <>
                            Ph.D. v oboru matematika a bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">IT4Innovations</Link>. Drží metodiku, scope zadání a
                            kvalitu výstupů tak, aby sprint vedl k rozhodnutí nebo funkčnímu prototypu, ne k hezké
                            prezentaci bez dalšího použití.
                        </>
                    }
                    pavolDescription={
                        <>
                            Developer s 15+ lety praxe a aktivní{' '}
                            <Link href="https://www.pavolhejny.com/">open-source contributor</Link>. Přináší praktický
                            pohled na vývoj, tooling, prototypování a na to, co je po hackathonu skutečně udržitelné v
                            produktu nebo interním procesu.
                        </>
                    }
                />

                <PricingSection
                    title="Jak se zapojit"
                    description="Zadání můžete přihlásit zdarma, účast vývojářů je zdarma. Placená je jen partnerská varianta pro firmy, které chtějí mít brief pečlivě připravený, odmoderovaný a dotažený k použitelným výstupům."
                    plans={hackathonFactoryPricing}
                    footnotes={hackathonFactoryPricingFootnotes}
                    showBillingToggle={false}
                    openSourceGuaranteeText="Úvodní 30min konzultace je zdarma a bez závazků. Pokud zjistíme, že zadání pro Hackathon Factory není vhodné, řekneme to rovnou a doporučíme jiný postup."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
