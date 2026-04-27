'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { IntegrationsSection } from '@/components/integrations-section';
import { OldHeroSection } from '@/components/old-hero-section';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import { forAgroBenefits } from '@/config/for-agro/forAgroBenefits';
import { forAgroConversation } from '@/config/for-agro/forAgroConversation';
import { forAgroIntegrations } from '@/config/for-agro/forAgroIntegrations';
import { forAgroPricing, forAgroPricingFootnotes } from '@/config/for-agro/forAgroPricing';
import { forAgroTestimonials } from '@/config/for-agro/forAgroTestimonials';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export function ForAgroPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ForAgroPage"
                    title="Jste připraveni převést agronomické know-how do AI?"
                    requestSent="Děkujeme, ozveme se."
                    specialistContact="Náš specialista vás bude brzy kontaktovat."
                    ceoOf="CEO společnosti Promptbook"
                    description="Naplánujte si bezplatnou a nezávaznou konzultaci a zjistěte, jak může Promptbook pomoci vašemu agronomickému týmu škálovat expertizu, compliance i provozní know-how."
                    emailPlaceholder="jmeno@agrofirma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Nezávazně poptat"
                />
            </Suspense>

            <main className="min-h-screen">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Proč Promptbook?"
                    integrationsText="Případy použití"
                    pricingText="Ceník"
                    getStartedText="Začít"
                />

                <Suspense>
                    <OldHeroSection
                        conversation={forAgroConversation}
                        backgroundImage="/backgrounds/for-agro.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                                        <BookOpen className="h-4 w-4" />
                                        AI pro {you || 'agronomii a zemědělské provozy'}
                                    </div>
                                    <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                        Vytvořte AI, která{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            skutečně rozumí
                                        </span>{' '}
                                        {you || <>agronomii vašeho podniku</>}
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-relaxed text-white sm:text-xl">
                                        S Promptbookem zachytíte agronomické know-how, regulatorní pravidla i provozní
                                        postupy do AI agentů, kteří pomáhají týmům napříč regiony.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    >
                                        Začít
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-4 text-sm opacity-80 sm:gap-8">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Open-source řešení
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Vaše data, Vaše kontrola
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Škálování napříč regiony
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <BenefitsSection
                    title="AI řešení pro agronomy a zemědělské společnosti"
                    description="Zachyťte odborné know-how, zrychlete rozhodování v terénu a držte compliance pod kontrolou s AI, která zná vaše dokumenty i procesy."
                    benefits={forAgroBenefits}
                />
                <IntegrationsSection
                    title="Kde využít AI v agronomii"
                    description="Od terénních dotazů přes compliance až po logistiku: váš AI odborník může fungovat tam, kde ho tým opravdu potřebuje."
                    integrations={forAgroIntegrations}
                />
                <TestimonialsSection
                    title="Co o nás říkají"
                    description="Promptbook pomáhá převádět odborné know-how do AI systémů, které jsou použitelné v reálném provozu."
                    testimonials={forAgroTestimonials}
                />
                <PricingSection
                    title="Jednoduché a škálovatelné ceny"
                    description="Od pilotu pro jeden agronomický tým po řešení pro více regionů a velké holdingy. Začněte tam, kde dává největší smysl."
                    plans={forAgroPricing}
                    footnotes={forAgroPricingFootnotes}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText="Promptbook je open-source a můžete začít pilotem bez vendor lock-inu. Když agronomický use-case nebude dávat smysl, řekneme to rovnou."
                />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection
                    title="Náš tým"
                    description="Jsme tým, který pomáhá firmám převádět odborné know-how, procesy a dokumentaci do AI systémů, které fungují bezpečně i v regulovaném provozu."
                    jiriDescription={
                        <>
                            Ph.D. v oboru matematika, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">Národním superpočítačovém centru IT4I</Link>. Pomáhá
                            navrhovat, jak převést složité odborné znalosti a metodiky do srozumitelného AI workflow.
                        </>
                    }
                    pavolDescription={
                        <>
                            Významný <Link href="https://www.pavolhejny.com/">open-source přispěvatel</Link> s více než
                            15 lety zkušeností ve vývoji softwaru. Zaměřuje se na praktickou implementaci AI agentů,
                            integrace a bezpečné nasazení do firemních procesů.
                        </>
                    }
                />
                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}
