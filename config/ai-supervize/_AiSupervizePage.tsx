'use client';

import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { aiSupervizeConversation } from '@/config/ai-supervize/aiSupervizeConversation';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const situations = [
    {
        id: 'A',
        title: 'AI zatím nepoužíváte / nejste si jistí',
        bullets: [
            'Vybereme use-casy s nejvyšším dopadem pro první měsíc.',
            'Nastavíme bezpečnost a pravidla pro práci s daty.',
            'Doporučíme nástroje a modely s rozumnými náklady.',
            'Připravíme tým na onboarding, šablony a měření.',
        ],
        goal: 'Cíl: rychlý a bezpečný start bez průšvihů, s jasným dalším krokem.',
    },
    {
        id: 'B',
        title: 'AI už používáte, ale výsledky kolísají',
        bullets: [
            'Sjednotíme workflow tvorby změn a review.',
            'Snížíme rework a regresní chyby.',
            'Zlepšíme dokumentaci a AI-readiness repozitáře.',
            'Zavedeme metriky dopadu, aby bylo vidět co funguje.',
        ],
        goal: 'Cíl: méně chaosu, více výkonu stabilně a dlouhodobě.',
    },
];

const symptoms = [
    'Nechceme pouštět kód ven a bojíme se o citlivá data.',
    'Nevíme, kde začít a co je pro nás relevantní.',
    'AI generuje hodně kódu, ale kvalita kolísá a review bolí.',
    'PR jsou velká, těžko se kontrolují a často se vrací.',
    'Každý používá jiný nástroj, nikdo neví kdy co použít.',
    'Dokumentace je slabá, AI nerozumí projektu a návrhy jsou mimo.',
    'AI někdy pomáhá a někdy rozbije den.',
];

const deliverables = [
    {
        title: '1) AI Adoption Plan (Start / Scale)',
        bullets: [
            'Doporučení zda a jak AI zavést (nebo proč zatím ne).',
            'Prioritizované use-casy: rychlé výhry vs. systémové změny.',
            'Rozhodnutí pro tooling, modely a režim dat v kontextu vašeho týmu.',
        ],
    },
    {
        title: '2) AI Development Playbook (PDF/Notion/MD)',
        bullets: [
            'Workflow od požadavku po merge při práci s AI.',
            'Pravidla: co delegovat, co kontrolovat a co zakázat.',
            'Definition of Done pro AI-pomáhané změny.',
            'Doporučený proces code review včetně AI asistence.',
        ],
    },
    {
        title: '3) Tool & Model Matrix (PDF/Notion/MD)',
        bullets: [
            'Mapování nástrojů a modelů na konkrétní typy úloh.',
            'Pravidla povolené/zakázané použití a práce s citlivými daty.',
            'Doporučení s ohledem na náklady a návratnost.',
        ],
    },
    {
        title: '4) Repo & PR šablony (PDF/Notion/MD)',
        bullets: [
            'Šablony pro issue, PRD, PR a commit messages.',
            'Checklisty pro review a release.',
            'Doporučená branch strategie podle reality týmu.',
        ],
    },
    {
        title: '5) Implementační plán 30/60/90 dní',
        bullets: [
            'Konkrétní backlog položky s prioritou a očekávaným dopadem.',
            'Metriky: lead time, doba review, reopen rate, incident rate.',
            'Jasná kritéria jak poznat, že změny opravdu fungují.',
        ],
    },
];

const processSteps = [
    {
        title: '1) Discovery workshop (2-3 h online)',
        bullets: [
            'Projdeme, jak dnes tvoříte změny od požadavku po merge.',
            'Vyjasníme cíle a omezení: bezpečnost, rozpočet, procesy.',
            'Najdeme oblasti s nejvyšším dopadem a zbytečným rizikem.',
        ],
        output: 'Výstup: shrnutí + doporučení dalšího postupu.',
    },
    {
        title: '2) Návrh a nastavení (online nebo u vás)',
        bullets: [
            'Dodáme Adoption Plan, Playbook, Matrix a šablony.',
            'Předáme 30/60/90 implementační plán s prioritami.',
            'Výstupy společně doladíme tak, aby šly reálně zavést.',
        ],
        output: 'Výstup: hotový systém práce s AI připravený pro tým.',
    },
    {
        title: '3) Měsíční follow-up',
        bullets: [
            'Vyhodnocujeme metriky a dopad na delivery.',
            'Upravujeme pravidla a šablony podle reality.',
            'Pomáháme řešit nové problémy a vyhodnocovat nové nástroje.',
        ],
        output: 'Výstup: kontinuální zlepšování bez návratu k ad-hoc režimu.',
    },
];

const focusAreas = [
    'AI coding nástroje: Codex, Claude Code, Copilot, Cline, Codeium, Cursor.',
    'Výběr modelu podle typu úlohy: architektura, refaktor, testy, debug, dokumentace.',
    'VS Code / JetBrains / AI IDE: nastavení, agenti, bezpečnost.',
    'Git workflow: worktree, bisect, branch strategie, velikost PR, review flow.',
    'Code observability a rychlejší debugování s AI.',
    'Dokumentace pro AI: co má repozitář obsahovat, aby AI navrhovala správně.',
    'Pipeline PRD -> Issue -> PR pro spolehlivé doručování.',
    'Logging, error handling, CI/CD: kde AI pomáhá a kde je naopak riziková.',
];

const pricing = [
    {
        title: 'Discovery workshop (2-3 h)',
        price: '5 000 Kč',
        items: [
            'Pokud zjistíme, že AI Supervize není vhodná, neúčtujeme nic.',
            'Pokud pokračujeme, částku započítáme do balíčku Supervize.',
        ],
    },
    {
        title: 'AI Supervize (návrh + nastavení + výstupy)',
        price: '80 000 Kč',
        items: [
            'Adoption Plan + Playbook + Matrix + šablony + 30/60/90 plán.',
            'Workshop nad výsledky a doladění.',
            'Krátká async podpora během zavádění.',
        ],
    },
    {
        title: 'Follow-up (měsíční režim)',
        price: '15 000 Kč / měsíc',
        items: [
            '1x měsíční review (60-90 min).',
            'Průběžné konzultace v domluveném kanálu.',
            'Úpravy playbooku a šablon podle reality týmu.',
        ],
    },
];

export function AiSupervizePage() {
    return (
        <>
            <Suspense>
                <BusinessGetStartedModal
                    placeName="AiSupervizePage"
                    title="Chcete z AI udělat řízený výkon ve vašem týmu?"
                    requestSent="Požadavek odeslán"
                    specialistContact="Ozveme se vám s návrhem termínu discovery workshopu."
                    ceoOf="AI Supervize, AI Web s.r.o."
                    description="Během 2-3 hodin společně vyhodnotíme, jestli AI Supervize dává vašemu týmu smysl a jak má vypadat konkrétní další krok."
                    emailPlaceholder="jmeno@firma.cz"
                    phonePlaceholder="+420 777 000 000"
                    errorNoEmailOrPhone="Zadejte prosím e-mail nebo telefon"
                    sending="Odesílám..."
                    scheduleCall="Domluvit workshop"
                />
            </Suspense>
            <main className="min-h-screen">
                <Header
                    tryItYourselfText={null}
                    whyPromptbookText="Program"
                    integrationsText="Výstupy"
                    pricingText="Cena"
                    getStartedText="Domluvit workshop"
                />
                <Suspense>
                    <HeroSection
                        conversation={aiSupervizeConversation}
                        backgroundImage="/backgrounds/for-industry.svg"
                        getHero={() => (
                            <>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                        <BookOpen className="w-4 h-4" />
                                        AI Supervize pro CTO, CEO a Tech Leady
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                                        Z AI uděláme{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            kontrolovaný výkon
                                        </span>
                                        , ne loterii
                                    </h1>
                                    <p className="text-xl text-white leading-relaxed">
                                        Praktický program pro software týmy, které chtějí zkrátit time-to-merge,
                                        snížit rework a zavést bezpečné, opakovatelné workflow s AI.
                                    </p>
                                </div>

                                <br />
                                <Link href="?modal=get-started">
                                    <Button
                                        size="lg"
                                        className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                    >
                                        Domluvit discovery workshop
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="flex flex-wrap items-center gap-6 text-sm opacity-80">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Kratší time-to-merge
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Méně reworku a regresí
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Bezpečné a jednotné používání AI
                                    </div>
                                </div>
                            </>
                        )}
                    />
                </Suspense>

                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <blockquote className="text-xl md:text-2xl font-semibold text-gray-900 border-l-4 border-promptbook-blue-dark pl-6">
                            Výsledek není přednáška o AI. Výsledek je rozhodnutí, plán, playbook, šablony a měřitelné
                            metriky pro váš konkrétní produkt a tým.
                        </blockquote>
                    </div>
                </section>

                <section id="benefits" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pro koho je AI Supervize</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Pro firmy, které vyvíjejí vlastní produkt a chtějí přejít z ad-hoc používání AI na
                                systematický výkon. Typicky Full-Stack / TypeScript / JavaScript / Next.js, ale
                                přizpůsobíme se i jinému stacku.
                            </p>
                            <p className="mt-3 text-base text-gray-600">
                                Pokud zjistíme, že pro vás AI Supervize není vhodná, řekneme to rovnou a doporučíme
                                alternativu.
                            </p>
                        </div>

                        <div className="mt-12 grid lg:grid-cols-2 gap-8">
                            {situations.map((situation) => (
                                <article
                                    key={situation.id}
                                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                                >
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {situation.id}) {situation.title}
                                    </h3>
                                    <ul className="mt-6 space-y-3">
                                        {situation.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-3 text-gray-700">
                                                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-6 font-semibold text-gray-900">{situation.goal}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-16 max-w-5xl mx-auto">
                            <h3 className="text-2xl font-bold text-center text-gray-900">
                                Typické symptomy, které řešíme
                            </h3>
                            <ul className="mt-8 grid md:grid-cols-2 gap-4">
                                {symptoms.map((symptom) => (
                                    <li
                                        key={symptom}
                                        className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-gray-700"
                                    >
                                        {symptom}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section id="integrations" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Co dostanete</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Konkrétní výstupy, které můžete hned zavést do každodenní práce týmu.
                            </p>
                        </div>

                        <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {deliverables.map((deliverable) => (
                                <article
                                    key={deliverable.title}
                                    className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
                                >
                                    <h3 className="text-xl font-bold text-gray-900">{deliverable.title}</h3>
                                    <ul className="mt-4 space-y-2">
                                        {deliverable.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-2 text-gray-700 text-sm">
                                                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-promptbook-blue-dark"></span>
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Jak AI Supervize probíhá</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Postup je navržený tak, aby přinesl rychlé rozhodnutí i dlouhodobě udržitelný výkon.
                            </p>
                        </div>

                        <div className="mt-12 grid lg:grid-cols-3 gap-6">
                            {processSteps.map((step) => (
                                <article key={step.title} className="bg-white rounded-2xl p-6 border border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                    <ul className="mt-4 space-y-3">
                                        {step.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-2 text-gray-700 text-sm">
                                                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-5 text-sm font-semibold text-gray-900">{step.output}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Na co se u vás podíváme prakticky
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Neřešíme teorii. Řešíme konkrétní nástroje, workflow a bottlenecky ve vašem delivery
                                procesu.
                            </p>
                        </div>
                        <ul className="mt-10 grid md:grid-cols-2 gap-4">
                            {focusAreas.map((area) => (
                                <li key={area} className="rounded-xl border border-gray-200 p-4 text-gray-700 bg-gray-50">
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="py-16 bg-gray-900 text-white">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h2 className="text-3xl font-bold">Bezpečnost a důvěrnost</h2>
                        <ul className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                            <li className="rounded-xl bg-white/10 p-4 border border-white/20">
                                Standardně pracujeme pod NDA.
                            </li>
                            <li className="rounded-xl bg-white/10 p-4 border border-white/20">
                                Dopředu nastavíme pravidla pro data: co smí do AI a co ne.
                            </li>
                            <li className="rounded-xl bg-white/10 p-4 border border-white/20">
                                Pro vyšší nároky navrhujeme redakci dat, izolované prostředí i interní modely.
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="pricing" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cena</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Transparentní model od prvního workshopu po dlouhodobý follow-up.
                            </p>
                        </div>

                        <div className="mt-12 grid lg:grid-cols-3 gap-6">
                            {pricing.map((item) => (
                                <article key={item.title} className="rounded-2xl border border-gray-200 p-7 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="mt-3 text-3xl font-extrabold text-gray-900">{item.price}</p>
                                    <ul className="mt-6 space-y-3">
                                        {item.items.map((point) => (
                                            <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                                                <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Zatím nejsme plátci DPH, uvedené ceny jsou konečné.
                        </p>
                    </div>
                </section>

                <TeamSection
                    title="Kdo vás provede"
                    description={
                        <>
                            Jsme <b>AI Web s.r.o.</b> a vyvíjíme produkt <b>Promptbook</b> pro nasazování AI agentů.
                            AI používáme denně v reálném vývoji i produkčním nasazení.
                        </>
                    }
                    jiriDescription={
                        <>
                            Ph.D. v oboru matematika, bývalý výzkumník v{' '}
                            <Link href="https://www.it4i.cz/">Národním superpočítačovém centru IT4I</Link>.
                        </>
                    }
                    pavolDescription={
                        <>
                            Developer s více než 15 lety praxe a aktivní{' '}
                            <Link href="https://www.pavolhejny.com/">open-source contributor</Link>.
                        </>
                    }
                />

                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Jak začít</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Napište nám na{' '}
                            <Link href="mailto:jiri@ptbk.io" className="text-promptbook-blue-dark font-semibold">
                                jiri@ptbk.io
                            </Link>{' '}
                            nebo{' '}
                            <Link href="mailto:pavol@ptbk.io" className="text-promptbook-blue-dark font-semibold">
                                pavol@ptbk.io
                            </Link>{' '}
                            a domluvíme úvodní schůzku.
                        </p>
                        <p className="mt-2 text-base text-gray-700">
                            Během 2-3 hodin budete vědět, jestli vám AI Supervize přinese hodnotu a co bude další krok.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <Link href="?modal=get-started">
                                <Button size="lg" className="bg-promptbook-blue-dark text-white hover:bg-primary/90">
                                    Domluvit úvodní schůzku
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer
                    productHeader="Produkt"
                    productLinks={[
                        { href: '/ai-supervize', text: 'AI Supervize' },
                        { href: '?modal=get-started', text: 'Domluvit workshop' },
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
                        { href: 'mailto:jiri@ptbk.io', text: 'jiri@ptbk.io' },
                        { href: 'mailto:pavol@ptbk.io', text: 'pavol@ptbk.io' },
                        { href: 'https://linkedin.com/company/promptbook', text: 'LinkedIn' },
                        { href: '/contact', text: 'Více kontaktů' },
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
