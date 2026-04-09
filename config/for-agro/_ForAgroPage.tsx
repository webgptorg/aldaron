'use client';

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
import forAgroBook from '@/config/for-agro/for-agro.book';
import { forAgroBenefits } from '@/config/for-agro/forAgroBenefits';
import { forAgroConversation } from '@/config/for-agro/forAgroConversation';
import { forAgroIntegrations } from '@/config/for-agro/forAgroIntegrations';
import { forAgroPricing, forAgroPricingFootnotes } from '@/config/for-agro/forAgroPricing';
import { forAgroTestimonials } from '@/config/for-agro/forAgroTestimonials';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * Agronomy-focused landing page based on the existing business subpage structure.
 */
export function ForAgroPage() {
    const isLocalhost = useIsLocalhost();

    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="ForAgroPage"
                    title="Jste připraveni posílit agronomická rozhodnutí pomocí AI?"
                    requestSent="Poptávka odeslána!"
                    specialistContact="Náš specialista vás bude brzy kontaktovat."
                    ceoOf="CEO společnosti Promptbook"
                    description="Domluvte si nezávaznou konzultaci a zjistěte, jak Promptbook pomůže škálovat agronomické know-how napříč celou firmou."
                    emailPlaceholder="jmeno@agro-firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo."
                    genericErrorMessage="Nastala chyba. Zkuste to prosím znovu."
                    sending="Odesílání..."
                    scheduleCall="Nezávazně poptat"
                />
            </Suspense>

            <main className="min-h-screen">
                <Header
                    tryItYourselfText="Vyzkoušet"
                    whyPromptbookText="Přínosy"
                    integrationsText="Případy využití"
                    pricingText="Ceník"
                    getStartedText="Nezávazně poptat"
                />

                <Suspense>
                    <HeroSection
                        conversation={forAgroConversation}
                        backgroundImage="/backgrounds/for-agro.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI transformace pro {you || 'zemědělské společnosti'}
                                    </div>

                                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                        AI agronom, který rozumí{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            Vašim plodinám
                                        </span>{' '}
                                        i procesům
                                    </h1>

                                    <p className="text-xl text-white leading-relaxed">
                                        Pomáháme agronomickým týmům převést expertízu o plodinách, půdě, compliance a
                                        provozu do AI odborníka, který je dostupný napříč celou organizací.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                    >
                                        Nezávazně poptat
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex items-center gap-8 text-sm opacity-80">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Open-source řešení
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Vaše data pod kontrolou
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Škálovatelné napříč regiony
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <Suspense>
                    <TryItYourselfSection
                        initialBook={forAgroBook}
                        tryItYourself="Vyzkoušejte si agronomického agenta"
                        tryChatting="Zkuste si popovídat s AI agronomem."
                    />
                </Suspense>

                <BenefitsSection
                    title="Proč je Promptbook vhodný pro agronomii"
                    description="Získejte konzistentní rozhodování nad agronomickými znalostmi, regulatorními požadavky i provozní dokumentací."
                    benefits={forAgroBenefits}
                />

                <IntegrationsSection
                    title="Případy využití v zemědělské firmě"
                    description="Nasazení od terénních agronomů přes compliance agendu až po logistiku a interní provoz."
                    integrations={forAgroIntegrations}
                />

                <TestimonialsSection
                    title="Co o Promptbooku říkají"
                    description="Přístup postavený na firemním kontextu pomáhá týmům zavádět AI bezpečně a smysluplně."
                    testimonials={forAgroTestimonials}
                />

                <TeamSection
                    title="Tým, který vám pomůže s nasazením"
                    description="Jsme tým zkušených profesionálů, kteří pomáhají organizacím převádět expertní znalosti do prakticky využitelné AI."
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

                <PricingSection
                    title="Ceník pro agronomické využití"
                    description="Od pilotního nasazení po enterprise provoz bez skrytých poplatků."
                    plans={forAgroPricing}
                    footnotes={forAgroPricingFootnotes}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText="Každý plán zachovává kontrolu nad vašimi daty a interními postupy."
                />

                {isLocalhost && <PlaygroundSection />}
                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}

