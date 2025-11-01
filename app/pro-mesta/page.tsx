'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import proMestaBook from '@/config/pro-mesta/pro-mesta.book';
import { proMestaBenefits } from '@/config/pro-mesta/proMestaBenefits';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function ProMestaPage() {
    return (
        <>
            <Suspense>
                <BusinessGetStartedModal placeName="ProMestaPage" />
            </Suspense>
            <main className="min-h-screen">
                <Header />
                <Suspense>
                    <HeroSection
                        initialBook={proMestaBook}
                        backgroundImage="/backgrounds/for-industry.svg"
                        getHero={({ you }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Transformace pro {you || 'města a obce'}
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                        Vytvořte AI, která{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            skutečně rozumí
                                        </span>{' '}
                                        {you || <>městům a obcím</>}
                                    </h1>
                                    <p className="text-xl text-white leading-relaxed">
                                        S Promptbookem můžete zachytit kontext, pravidla a znalosti vaší organizace do
                                        jednoduchých dokumentů a vytvořit tak AI agenty, kteří dokonale odpovídají vašim
                                        potřebám.
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
                    description="Zefektivněte operace, snižte zátěž a vylepšete služby s AI agenty přizpůsobenými vašim potřebám."
                    benefits={proMestaBenefits}
                />
                <TeamSection
                    title="Náš tým"
                    description="Jsme oddaná skupina profesionálů, kteří se zavázali využívat AI k transformaci podniků. S různými zkušenostmi v oblasti technologií, výzkumu a podnikání:"
                    jiriDescription={
                        <>
                            Ph.D. v matematice, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">IT4I Národním superpočítačovém centru</Link>.
                        </>
                    }
                    pavolDescription={
                        <>
                            Přední <Link href="https://www.pavolhejny.com/">open-source přispěvatel</Link> v ČR. Vývojář
                            s více než 15 lety zkušeností.
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
                    connectHeader="Spojení"
                    connectLinks={[
                        { href: 'https://github.com/webgptorg/promptbook', text: 'GitHub' },
                        { href: 'https://linkedin.com/company/promptbook', text: 'LinkedIn' },
                        { href: 'https://discord.gg/x3QWNaa89N', text: 'Discord' },
                        { href: '/contact', text: 'Více' },
                    ]}
                    stayUpdatedHeader="Zůstaňte v obraze"
                    emailLabel="E-mail *"
                    consentLabel="Souhlasím se zasíláním novinek a aktualizací e-mailem *"
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
