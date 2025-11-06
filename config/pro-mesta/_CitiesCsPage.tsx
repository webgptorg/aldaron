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
import citiesCsBook from '@/config/pro-mesta/citiesCs.book';
import { citiesCsBenefits } from '@/config/pro-mesta/citiesCsBenefits';
import { citiesCsConversation } from '@/config/pro-mesta/citiesCsConversation';
import { citiesCsIntegrations } from '@/config/pro-mesta/citiesCsIntegrations';
import { citiesCsPricing } from '@/config/pro-mesta/citiesCsPricing';
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
                    emailPlaceholder="jmeno@uzasna-spolecnost.com"
                    phonePlaceholder="+420 123 456 789"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefonní číslo"
                    sending="Odesílání..."
                    scheduleCall="Naplánovat konzultaci"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header
                    tryItYourselfText="Vyzkoušejte si to sami"
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
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Transformace pro {you || 'města a obce'}
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                        AI, která{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            mluví jazykem
                                        </span>{' '}
                                        {you || <>Vaší obce</>}
                                    </h1>
                                    <p className="text-xl text-white leading-relaxed">
                                        Promptbook pomáhá samosprávám vytvářet kontext a znalosti, které zajišťují, že
                                        umělá inteligence opravdu rozumí místním specifikům.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                    >
                                        Začít {you ? <>s AI ve vašem městě</> : <>s Promptbook AI</>}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex items-center gap-8 text-sm opacity-80">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Otevřený software
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Vaše data, vaše kontrola
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Snadné nastavení
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <BenefitsSection
                    title="AI-Powered řešení pro města a obce"
                    description="Zefektivněte provoz, snižte administrativní zátěž a vylepšete služby s AI agenty přizpůsobenými vašim potřebám."
                    benefits={citiesCsBenefits}
                />
                <IntegrationsSection
                    title="Kde využít vašeho AI agenta"
                    description="Nasaďte vaše AI agenty definované v Promptbooku v široké škále aplikací a scénářů."
                    integrations={citiesCsIntegrations}
                />
                <TestimonialsSection
                    title="Co o nás říkají"
                    description="Zjistěte, jak Promptbook usnadňuje práci profesionálů po celém světě:"
                    testimonials={citiesCsTestimonials}
                />

                <Suspense>
                    <TryItYourselfSection
                        initialBook={citiesCsBook}
                        // <- TODO: [🌆] Pass the initial message to `TryItYourselfSection`
                        tryItYourself="Vyzkoušejte si to sami"
                        tryChatting="Zkuste si popovídat s {agentName} sami:"
                        helpMessage="Můžete mi pomoci?"
                        welcomeMessage={(agentName: string) =>
                            `Jsem právník společnosti ${agentName}. Poskytuji právní poradenství a podporu společnosti a jejím zaměstnancům se zaměřením na dodržování zákonů a firemních zásad. Jak vám mohu pomoci?`
                        }
                    />
                </Suspense>
                <PricingSection
                    title="Jednoduché a transparentní ceny"
                    description="Vyberte si plán, který nejlépe vyhovuje vašim obchodním potřebám."
                    plans={citiesCsPricing}
                    monthlyText="Měsíčně"
                    yearlyText="Ročně"
                    saveText="Ušetřete"
                    openSourceGuaranteeText="Všechny plány zahrnují naši open-source záruku: Vaše data, vaše kontrola, a to vždy."
                />
                {isLocalhost && <PlaygroundSection />}
                <TeamSection
                    title="Náš tým"
                    description="Jsme oddaná skupina profesionálů, kteří se věnují využití AI k transformaci podniků. Naše zkušenosti pokrývají oblast technologií, výzkumu a podnikání:"
                    jiriDescription={
                        <>
                            Ph.D. v matematice, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">IT4I Národním superpočítačovém centru</Link>.
                        </>
                    }
                    pavolDescription={
                        <>
                            Přední <Link href="https://www.pavolhejny.com/">open-source přispěvatel</Link> v ČR s více
                            než 15 lety vývojářských zkušeností.
                        </>
                    }
                />
                <Footer
                    productHeader="Produkt"
                    productLinks={[
                        { href: '?modal=get-started', text: 'Začít' },
                        { href: 'https://ptbk.io/manifest', text: 'Manifest' },
                        { href: 'https://github.com/webgptorg/promptbook', text: 'Dokumentace' },
                        { href: 'https://promptbook.studio/miniapps/new', text: 'Hřiště' },
                    ]}
                    companyHeader="Společnost"
                    companyLinks={[
                        {
                            href: 'https://or-justice-cz.translate.goog/ias/ui/rejstrik-firma.vysledky?subjektId=1223693&typ=UPLNY&_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp',
                            text: '	AI Web s.r.o.',
                        },
                        { href: 'https://ptbk.io/about', text: 'O nás' },
                        { href: 'https://ptbk.io/blog', text: 'Blog' },
                    ]}
                    connectHeader="Spojte se s námi"
                    connectLinks={[
                        { href: 'https://github.com/webgptorg/promptbook', text: 'GitHub' },
                        { href: 'https://linkedin.com/company/promptbook', text: 'LinkedIn' },
                        { href: 'https://discord.gg/x3QWNaa89N', text: 'Discord' },
                        { href: '/contact', text: 'Více' },
                    ]}
                    stayUpdatedHeader="Zůstaňte v obraze"
                    emailLabel="E-mail *"
                    consentLabel="Souhlasím se zasíláním novinek e-mailem *"
                    subscribeButtonText="Odebírat"
                    subscribingButtonText="Odebírám..."
                    successMessage="Úspěšně přihlášeno!"
                    rightsReservedText="Všechna práva vyhrazena."
                    projectFundingText={
                        <>
                            Tento projekt byl realizován za finanční podpory z národního rozpočtu
                            <br />
                            prostřednictvím Ministerstva průmyslu a obchodu České republiky v rámci programu CzechInvest
                            Technologická inkubace.
                        </>
                    }
                />
            </main>
        </>
    );
}

/**
 * TODO: !!! [🌆] `/pro-mesta` Better copy of hero section
 * TODO: !!! [🌆] `/pro-mesta` Fix the footer
 * TODO: !!! Zig-zag the bg of the sections
 */
