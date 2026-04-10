'use client'; // <- TODO: !!! Maybe not ideal here

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TryItYourselfSection } from '@/components/try-it-yourself-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import citiesCsBook from '@/config/pro-mesta/citiesCs.book';
import { citiesCsBenefits } from '@/config/pro-mesta/citiesCsBenefits';
import { citiesCsConversation } from '@/config/pro-mesta/citiesCsConversation';
import { citiesCsIntegrations } from '@/config/pro-mesta/citiesCsIntegrations';
import { citiesCsPricing, citiesCsPricingFootnotes } from '@/config/pro-mesta/citiesCsPricing';
import { citiesCsTestimonials } from '@/config/pro-mesta/citiesCsTestimonials';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function CitiesCsPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ProMestaPage"
                    title="Jste připraveni na transformaci vašeho města s pomocí AI?"
                    requestSent="Požadavek odeslán!"
                    specialistContact="Náš specialista vás bude brzy kontaktovat."
                    ceoOf="CEO společnosti Promptbook"
                    description="Naplánujte si bezplatnou a nezávaznou konzultaci a zjistěte, jak může Promptbook revolučně změnit znalosti vaší společnosti a posílit váš tým."
                    emailPlaceholder="jmeno@mesto.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo"
                    sending="Odesílání..."
                    scheduleCall="Nezávazně poptat"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header
                    tryItYourselfText={null} // "Vyzkoušejte si to sami"
                    whyPromptbookText="Proč Promptbook?"
                    integrationsText="Integrace"
                    pricingText="Ceník"
                    getStartedText="Začněte"
                />
                <Suspense>
                    <HeroSection
                        conversation={citiesCsConversation}
                        backgroundImage="/backgrounds/pro-mesta.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Transformace pro {you || 'města a obce'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        AI odborník, který{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            mluví jazykem
                                        </span>{' '}
                                        {you || <>Vaší obce</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        Pomáháme samosprávám vytvářet kontext pro AI.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Začít
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Open-source řešení
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Vaše data, Vaše kontrola
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Jednoduché nasazení
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <BenefitsSection
                    title="AI řešení pro města a obce"
                    description="Zefektivněte provoz, snižte administrativní zátěž a vylepšete služby s AI odborníkem, který skutečně rozumí Vašemu městu."
                    benefits={citiesCsBenefits}
                />
                <IntegrationsSection
                    title="Kde využít vašeho AI odborníka"
                    description="Váš AI odborník není jen chat na webu. Může být integrován do různých kanálů a systémů."
                    integrations={citiesCsIntegrations}
                />
                <TestimonialsSection
                    title="Co o nás říkají"
                    description="Už jsme pomohli mnoha městům a obcím."
                    testimonials={citiesCsTestimonials}
                />

                {/*
                <Suspense>
                    <TryItYourselfSection
                        initialBook={citiesCsBook}
                        tryItYourself="Vyzkoušejte si to sami"
                        tryChatting="Zkuste si popovídat s {agentName} sami:"
                    />
                </Suspense>
                */}
                <PricingSection
                    title="Jednoduché a transparentní ceny"
                    description="Nabízíme plány od malých obcí až po velká města. Žádné skryté poplatky, žádné složité smlouvy."
                    plans={citiesCsPricing}
                    footnotes={citiesCsPricingFootnotes}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText={' '}
                />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection
                    title="Náš tým"
                    description="Jsme tým zkušených profesionálů, kteří pomáhají obcím a městům využívat umělou inteligenci."
                    jiriDescription={
                        <>
                            Ph.D. v oboru matematika, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">Národním superpočítačovém centru IT4I</Link>.
                        </>
                    }
                    pavolDescription={
                        <>
                            Významný <Link href="https://www.pavolhejny.com/">open-source přispěvatel</Link> v České
                            republice s více než 15 lety zkušeností ve vývoji softwaru.
                        </>
                    }
                />
                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}

/**
 * TODO: Zig-zag the bg of the sections
 */
