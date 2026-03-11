'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { ContentCardsSection } from '@/components/content-cards-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { SignalListSection } from '@/components/signal-list-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { aiSupervizeBenefits } from '@/config/ai-supervize/aiSupervizeBenefits';
import {
    aiSupervizeDeliverables,
    aiSupervizeFocusAreas,
    aiSupervizeProcess,
    aiSupervizeSignals,
    aiSupervizeSituations,
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
                    title="Domluvit AI Supervizi?"
                    requestSent="Požadavek odeslán"
                    specialistContact="Ozveme se vám co nejdříve a navrhneme další krok."
                    ceoOf="CEO AI Web s.r.o."
                    description="Na úvodní schůzce rychle zjistíme, jestli AI Supervize dává smysl pro váš tým, kde má největší dopad a jak bezpečně začít."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo"
                    sending="Odesílání..."
                    scheduleCall="Domluvit schůzku"
                />
            </Suspense>

            <main className="min-h-screen bg-white">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Kde pomáháme"
                    integrationsText="Co dostanete"
                    pricingText="Ceník"
                    getStartedText="Domluvit workshop"
                />

                <Suspense>
                    <HeroSection
                        backgroundImage="/backgrounds/ai-supervize.svg"
                        conversation={aiSupervizeConversation}
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                                        <BookOpen className="h-4 w-4" />
                                        AI Supervize pro CTO, CEO a Tech Leady
                                    </div>
                                    <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                                        AI Supervize, která z AI udělá{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            kontrolovaný výkon
                                        </span>{' '}
                                        {you ? <>v {you}</> : <>ve vašem vývojovém týmu</>}
                                    </h1>
                                    <p className="text-xl leading-relaxed text-slate-100">
                                        Pro software firmy, které chtějí zkrátit time-to-merge, snížit rework a zavést
                                        jasná pravidla pro AI coding, review a bezpečnost dat.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Domluvit discovery workshop
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-white/85">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        TypeScript / JavaScript / Next.js týmy
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Pravidla pro data a standardně NDA
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Plán, playbook, šablony i metriky
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <section className="bg-white py-10">
                    <div className="container mx-auto px-4">
                        <div className="rounded-[2rem] border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-slate-50 p-8 shadow-sm lg:p-10">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                                Co je výsledkem
                            </p>
                            <blockquote className="mt-4 max-w-4xl text-2xl font-semibold leading-relaxed text-slate-900">
                                Výsledek není přednáška o AI. Výsledek je rozhodnutí, plán, playbook, šablony a
                                měřitelné metriky pro váš konkrétní produkt a tým.
                            </blockquote>
                        </div>
                    </div>
                </section>

                <BenefitsSection
                    title="Kde AI Supervize přináší nejrychlejší dopad"
                    description="Pomáháme týmům, které chtějí AI zavést bezpečně od nuly nebo zkrotit už existující ad-hoc používání."
                    benefits={aiSupervizeBenefits}
                />

                <ContentCardsSection
                    badge="Výchozí situace"
                    title="Dvě typické situace, se kterými se potkáváme"
                    description="Ať startujete od nuly, nebo už AI v týmu běží, cíl je stejný: předvídatelný výkon místo náhodné loterie."
                    items={aiSupervizeSituations}
                    columns={2}
                />

                <SignalListSection
                    title="Typické symptomy, které AI Supervize řeší"
                    description="Pokud se v několika bodech poznáváte, pravděpodobně nedělá problém samotná AI, ale chybějící workflow, pravidla a měření."
                    signals={aiSupervizeSignals}
                    footer={
                        <p className="text-base leading-relaxed">
                            Během discovery workshopu během 2-3 hodin poznáte, jestli vám AI Supervize opravdu přinese
                            hodnotu a kde začít s nejvyšším dopadem.
                        </p>
                    }
                />

                <ContentCardsSection
                    id="integrations"
                    badge="Výstupy"
                    title="Co po AI Supervizi dostanete do ruky"
                    description="Neodcházíte s obecnou prezentací, ale s materiály a workflow, které lze rovnou zavést do vývoje."
                    items={aiSupervizeDeliverables}
                    columns={3}
                />

                <ContentCardsSection
                    badge="Praktický fokus"
                    title="Na co se u vás podíváme konkrétně"
                    description="Od AI coding nástrojů přes velikost PR až po observability. Vše vztažené k tomu, jak váš tým opravdu dodává změny."
                    items={aiSupervizeFocusAreas}
                    columns={3}
                    theme="dark"
                />

                <ContentCardsSection
                    badge="Průběh spolupráce"
                    title="Jak AI Supervize probíhá"
                    description="Nejdřív rychle ověříme fit, pak dodáme konkrétní návrh a pokud chcete, průběžně pomáháme se zaváděním."
                    items={aiSupervizeProcess}
                    columns={3}
                />

                <PricingSection
                    title="Ceník AI Supervize"
                    description="Nejprve ověříme fit, pak dodáme konkrétní výstupy a podle potřeby nastavíme i navazující měsíční režim."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    openSourceGuaranteeText="Standardně pracujeme pod NDA a pravidla pro data nastavujeme předem."
                    showBillingToggle={false}
                    popularBadgeText="Nejčastější volba"
                />

                {isLocalhost && <PlaygroundSection />}

                <TeamSection
                    title="Kdo vás provede"
                    description={
                        <>
                            Promptbook je produkt AI Web s.r.o. pro nasazování AI v reálných organizacích a právě na
                            jeho vývoji i klientských implementacích denně řešíme AI supervision v praxi: workflow,
                            kvalitu kódu, bezpečnost dat i vyhodnocování dopadu.
                        </>
                    }
                    jiriDescription={
                        <>
                            Jiří spojuje výzkumnou rigoróznost s produkčním nasazením AI: má Ph.D. z matematiky, působil
                            v IT4I a dnes vede AI Web s.r.o., takže umí rozhodovat o modelech, evaluaci i rizicích na
                            úrovni CTO a CEO.
                        </>
                    }
                    pavolDescription={
                        <>
                            Pavol je developer s více než 15 lety praxe a aktivní open-source contributor; AI coding,
                            review workflow i kvalitu repa řeší denně na reálném produktu, ne jen na workshopových
                            ukázkách.
                        </>
                    }
                />

                <Footer
                    productHeader="Služby"
                    productLinks={[
                        { href: '?modal=get-started', text: 'Domluvit úvodní schůzku' },
                        { href: '/ai-supervize', text: 'AI Supervize' },
                        { href: 'https://ptbk.io/', text: 'Promptbook' },
                        { href: 'https://github.com/webgptorg/promptbook', text: 'Dokumentace' },
                    ]}
                    companyHeader="Společnost"
                    companyLinks={[
                        {
                            href: 'https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp',
                            text: 'AI Web s.r.o.',
                        },
                        {
                            href: 'https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp',
                            text: 'IČO: 21012288',
                        },
                        {
                            href: 'https://info.mojedatovaschranka.cz/info/cs/',
                            text: 'Datová schránka: hzuu4yn',
                        },
                    ]}
                    connectHeader="Spojte se s námi"
                    connectLinks={[
                        { href: 'https://github.com/webgptorg/promptbook', text: 'GitHub' },
                        { href: 'https://linkedin.com/company/promptbook', text: 'LinkedIn' },
                        { href: '/contact', text: 'Kontakt' },
                    ]}
                    stayUpdatedHeader="Zůstaňte v obraze"
                    emailLabel="E-mail *"
                    consentLabel="Souhlasím se zasíláním novinek e-mailem *"
                    subscribeButtonText="Odebírat"
                    subscribingButtonText="Odebírám..."
                    successMessage="Úspěšně přihlášeno"
                    rightsReservedText="Všechna práva vyhrazena."
                    claim="AI Supervize pro software týmy, které chtějí z AI udělat kontrolovaný výkon."
                    projectFundingText={
                        <>
                            Tento projekt byl realizován za finanční podpory z národního rozpočtu
                            <br />
                            prostřednictvím Ministerstva průmyslu a obchodu České republiky v rámci programu
                            CzechInvest Technologická inkubace.
                        </>
                    }
                />
            </main>
        </>
    );
}
