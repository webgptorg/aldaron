'use client';

import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { HackathonFactoryLogo } from '@/components/hackathon-factory-logo';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import { hackathonFactoryConversation } from '@/config/hackathon-factory/hackathonFactoryConversation';
import {
    hackathonFactoryAudience,
    hackathonFactoryHighlights,
    hackathonFactoryPrinciples,
    hackathonFactoryPrinciplesNote,
    hackathonFactoryProcess,
    hackathonFactoryProcessNote,
    hackathonFactorySituations,
} from '@/config/hackathon-factory/hackathonFactoryContent';
import {
    hackathonFactoryPricing,
    hackathonFactoryPricingFootnotes,
} from '@/config/hackathon-factory/hackathonFactoryPricing';
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
                    pricingText="Cena a účast"
                    getStartedText="Ozvat se"
                />

                <Suspense>
                    <HeroSection
                        conversation={hackathonFactoryConversation}
                        backgroundImage="/backgrounds/hackathon-factory.svg"
                        getHero={() => (
                            <>
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
                                        <HackathonFactoryLogo
                                            showWordmark={false}
                                            className="gap-0"
                                            markClassName="h-7 w-7 text-amber-300"
                                        />
                                        Hackathon Factory od AI Web s.r.o.
                                    </div>

                                    <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                                        Spojujeme{' '}
                                        <span className="bg-[linear-gradient(135deg,#fde68a_0%,#67e8f9_55%,#f8fafc_100%)] bg-clip-text text-transparent">
                                            reálné problémy
                                        </span>{' '}
                                        s vývojáři, kteří je umí dotáhnout do výsledku
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-white/85">
                                        Krátké hackathon sprinty pro CTO, startupy, inovátory i developery. Cílem není
                                        hackovat pro hackování, ale dodat prototyp, rozhodnutí nebo plán, který
                                        použijete hned další den.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="bg-amber-400 text-slate-950 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20 text-lg px-8 py-6 rounded-full"
                                        >
                                            Přihlásit problém nebo zájem
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm text-white/80 backdrop-blur-sm">
                                        Ozveme se do 24 hodin
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-white/75">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        1-2 dny intenzivního sprintu
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Online i prezenčně
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Prototyp, rozhodnutí nebo plán
                                    </div>
                                </div>

                                <div className="max-w-2xl rounded-3xl border border-white/15 bg-slate-950/35 p-5 text-sm leading-relaxed text-white/85 shadow-[0_24px_60px_rgba(2,6,23,0.25)] backdrop-blur-md">
                                    <p className="font-semibold text-amber-200">Nejde o soutěž pro efekt.</p>
                                    <p className="mt-2">
                                        Hackathon Factory je tržiště, které propojuje lidi s konkrétním problémem a
                                        týmy, které chtějí opravdu stavět. Když brief není dostatečně konkrétní nebo realizovatelný,
                                        řekneme to rovnou.
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
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{highlight.description}</p>
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
                    description="Když potřebujete něco ověřit, navrhnout nebo rozjet rychleji a nechcete zůstat jen u debaty."
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
                            Hackathon Factory organizuje <strong>AI Web s.r.o.</strong>, za kterou stojí Jiří Jahn a
                            Pavol Hejný. <strong>Promptbook</strong> je naše platforma pro nasazování AI agentů v
                            reálném provozu, takže do hackathonů přinášíme zkušenost z produkčních integrací,
                            prototypování i doručování technických řešení mimo teoretické workshopy.
                        </>
                    }
                    jiriDescription={
                        <>
                            Ph.D. v oboru matematika, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">IT4Innovations</Link>. Drží metodiku, zadání a kvalitu
                            výstupů tak, aby sprint vedl k rozhodnutí nebo funkčnímu prototypu.
                        </>
                    }
                    pavolDescription={
                        <>
                            Developer s 15+ lety praxe a aktivní{' '}
                            <Link href="https://www.pavolhejny.com/">open-source contributor</Link>. Přináší praktický
                            pohled na vývoj, tooling, prototypování a to, co je po hackathonu skutečně udržitelné.
                        </>
                    }
                />

                <PricingSection
                    title="Cena a účast"
                    description="Jste zadavatel problému, partner hackathonu nebo vývojář, který chce stavět? Zapojení držíme jednoduché a transparentní."
                    plans={hackathonFactoryPricing}
                    footnotes={hackathonFactoryPricingFootnotes}
                    showBillingToggle={false}
                    openSourceGuaranteeText="Každé zadání nejdřív projde krátkou úvodní konzultací. Pokud pro Hackathon Factory nebude vhodné, řekneme to rovnou a doporučíme jiný postup."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
