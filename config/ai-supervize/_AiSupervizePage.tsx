'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { CaseStudySection } from '@/components/case-study-section';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import { aiSupervizeBenefits } from '@/config/ai-supervize/aiSupervizeBenefits';
import { aiSupervizeCaseStudy } from '@/config/ai-supervize/aiSupervizeCaseStudy';
import {
    aiSupervizeDeliverables,
    aiSupervizeFocusAreas,
    aiSupervizeProcess,
    aiSupervizeSecurity,
    aiSupervizeSituations,
    aiSupervizeSituationsNote,
    aiSupervizeSymptoms,
} from '@/config/ai-supervize/aiSupervizeContent';
import { aiSupervizePricing, aiSupervizePricingFootnotes } from '@/config/ai-supervize/aiSupervizePricing';
import { useIsLocalhost } from '@/hooks/useIsLocalhost';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';

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

                {/* ── Hero Section ── */}
                <section
                    id="hero"
                    className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
                    style={{
                        backgroundImage: `url(/backgrounds/ai-supervize.svg)`,
                        backgroundSize: 'cover',
                        backgroundPosition: '50% 100%',
                    }}
                >
                    <div className="container mx-auto px-4 py-20 relative z-10 text-white">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column – copy */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-8"
                            >
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                        <BookOpen className="h-4 w-4" />
                                        AI Supervize pro software týmy
                                    </div>

                                    <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
                                        Zaveďte AI do vývoje jako{' '}
                                        <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                            kontrolovaný výkon
                                        </span>
                                        , ne náhodnou loterii
                                    </h1>

                                    <p className="max-w-2xl text-xl leading-relaxed text-white/85">
                                        Pomáháme firmám nastavit workflow, pravidla, nástroje a měření tak, aby AI
                                        opravdu pomáhala při vývoji software, místo aby přidávala chaos a riziko.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Link href="?modal=get-started">
                                        <Button
                                            size="lg"
                                            className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                        >
                                            Domluvit discovery workshop
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                    <div className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm text-white/80 backdrop-blur-sm">
                                        Ideální pro TypeScript / Next.js týmy
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 text-sm text-white/75">
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        NDA a pravidla pro data
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Playbook a konkrétní pravidla
                                    </div>
                                    <div className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        Měřitelný dopad{/* do 30 / 60 / 90 dní */}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Column – terminal chart */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="overflow-hidden rounded-xl border border-slate-700/70 bg-slate-950 shadow-2xl"
                            >
                                {/* ── Terminal title bar ── */}
                                <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
                                    <span className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="ml-3 flex-1 text-center font-mono text-xs text-slate-500 select-none">
                                        promptbook-supervize — bash — 80×24
                                    </span>
                                </div>

                                {/* ── Terminal body ── */}
                                <div className="p-5">
                                    <TerminalMetrics />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

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

                <CaseStudySection id="case-study" {...aiSupervizeCaseStudy} />

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
                    title="Jak AI Supervize probíhá krok za krokem"
                    description="Nejde o výběr plánu – projdete postupně všemi třemi fázemi. Začínáte discovery workshopem a dle výsledků pokračujete dál."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    showBillingToggle={false}
                    stepsMode={true}
                    openSourceGuaranteeText="Nezačínáte nákupem dalšího AI toolu. Začínáte rozhodnutím, kde má AI ve vašem vývoji skutečně fungovat."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}

// ── ASCII terminal metrics ────────────────────────────────────────────────────

const METRICS = [
    { metric: 'Čas do merge', before: 5.2, after: 3.1, unit: ' dny' },
    { metric: 'Rework kódu', before: 28, after: 15, unit: ' %' },
    { metric: 'Code review', before: 3.8, after: 2.2, unit: ' hod' },
    { metric: 'Bugy / sprint', before: 8, after: 4, unit: '' },
];

const BAR_W = 24;
const MAX_VAL = Math.max(...METRICS.map((m) => m.before));
const SEP = '─'.repeat(52);

function asciiBar(value: number, fill: number): string {
    const filled = Math.round((value / MAX_VAL) * BAR_W * fill);
    return '█'.repeat(filled) + '░'.repeat(BAR_W - filled);
}

type TLine = {
    key: string;
    delay: number; // ms after previous line
    node: (fill: number) => React.ReactNode;
};

function buildLines(): TLine[] {
    const lines: TLine[] = [
        {
            key: 'cmd',
            delay: 0,
            node: () => (
                <span>
                    <span className="text-emerald-400">❯ </span>
                    <span className="text-white">promptbook-supervize</span>
                    <span className="text-slate-300"> analyze</span>
                    <span className="text-cyan-400"> --sprint 12 --compare baseline</span>
                </span>
            ),
        },
        { key: 'b0', delay: 200, node: () => <span>&nbsp;</span> },
        {
            key: 'init',
            delay: 600,
            node: () => <span className="text-slate-400"> Initializing Promptbook AI Supervision v2.4.1...</span>,
        },
        {
            key: 'ok1',
            delay: 700,
            node: () => (
                <span>
                    <span className="text-slate-600"> [</span>
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-600">]</span>
                    <span className="text-slate-400"> Configuration loaded</span>
                </span>
            ),
        },
        {
            key: 'ok2',
            delay: 450,
            node: () => (
                <span>
                    <span className="text-slate-600"> [</span>
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-600">]</span>
                    <span className="text-slate-400"> Fetching sprint metrics</span>
                </span>
            ),
        },
        {
            key: 'ok3',
            delay: 550,
            node: () => (
                <span>
                    <span className="text-slate-600"> [</span>
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-600">]</span>
                    <span className="text-slate-400"> Baseline comparison ready</span>
                </span>
            ),
        },
        { key: 'b1', delay: 300, node: () => <span>&nbsp;</span> },
        { key: 'sep1', delay: 150, node: () => <span className="text-slate-700">{SEP}</span> },
        {
            key: 'hdr',
            delay: 80,
            node: () => (
                <span>
                    <span className="text-slate-600"> </span>
                    <span className="text-cyan-400 font-bold">METRICS REPORT</span>
                    <span className="text-slate-600"> · sprint-12 vs baseline</span>
                </span>
            ),
        },
        { key: 'sep2', delay: 80, node: () => <span className="text-slate-700">{SEP}</span> },
        { key: 'b2', delay: 200, node: () => <span>&nbsp;</span> },
        ...METRICS.flatMap((m, i) => [
            {
                key: `m${i}-label`,
                delay: i === 0 ? 200 : 350,
                node: () => <span className="text-slate-300"> {m.metric}</span>,
            },
            {
                key: `m${i}-before`,
                delay: 60,
                node: (fill: number) => (
                    <span>
                        <span className="text-slate-600"> before </span>
                        <span className="text-slate-500">{asciiBar(m.before, fill)}</span>
                        <span className="text-slate-500">
                            {' '}
                            {m.before}
                            {m.unit}
                        </span>
                    </span>
                ),
            },
            {
                key: `m${i}-after`,
                delay: 40,
                node: (fill: number) => (
                    <span>
                        <span className="text-slate-600"> after </span>
                        <span className="text-cyan-400">{asciiBar(m.after, fill)}</span>
                        <span className="text-cyan-300">
                            {' '}
                            {m.after}
                            {m.unit}
                        </span>
                        <span className="text-emerald-400"> −{Math.round((1 - m.after / m.before) * 100)}%</span>
                    </span>
                ),
            },
            { key: `m${i}-b`, delay: 60, node: () => <span>&nbsp;</span> },
        ]),
        { key: 'sep3', delay: 150, node: () => <span className="text-slate-700">{SEP}</span> },
        ...METRICS.map((m, i) => ({
            key: `s${i}`,
            delay: 130,
            node: () => (
                <span>
                    <span className="text-emerald-400"> ✓ </span>
                    <span className="text-slate-400" style={{ display: 'inline-block', minWidth: '14ch' }}>
                        {m.metric}
                    </span>
                    <span className="text-slate-500">
                        {m.before}
                        {m.unit}
                    </span>
                    <span className="text-slate-600"> → </span>
                    <span className="text-cyan-300">
                        {m.after}
                        {m.unit}
                    </span>
                    <span className="text-emerald-400"> −{Math.round((1 - m.after / m.before) * 100)} %</span>
                </span>
            ),
        })),
        { key: 'b3', delay: 200, node: () => <span>&nbsp;</span> },
        {
            key: 'done',
            delay: 300,
            node: () => <span className="text-slate-400"> Analysis complete. Ready for supervision setup.</span>,
        },
    ];
    return lines;
}

const LINES = buildLines();
const BAR_START_STEP = LINES.findIndex((l) => l.key === 'm0-before');

function TerminalMetrics() {
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [barFill, setBarFill] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Start animation only when the terminal scrolls into view.
    // On desktop the right-column terminal is immediately visible so it
    // fires straight away; on mobile it waits until the user scrolls down.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Reveal lines one by one – only after the terminal is visible.
    useEffect(() => {
        if (!started || step >= LINES.length) return;
        const id = setTimeout(() => setStep((s) => s + 1), LINES[step]!.delay);
        return () => clearTimeout(id);
    }, [started, step]);

    // Animate bar fill once we reach the bars section.
    useEffect(() => {
        if (step < BAR_START_STEP || barFill >= 1) return;
        const id = setInterval(() => setBarFill((f) => Math.min(1, f + 1 / BAR_W)), 38);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step >= BAR_START_STEP, barFill]);

    // Scroll inside the terminal box only – never touch the page scroll.
    // Using scrollTop directly avoids the page-level scroll that
    // scrollIntoView() triggers on mobile when the element is off-screen.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [step]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '420px',
                // Prevent the browser from propagating scroll momentum to the
                // page when the terminal content reaches its top/bottom edge.
                overscrollBehavior: 'contain',
            }}
            className="overflow-y-auto font-mono text-xs leading-[1.65] scrollbar-none"
        >
            {LINES.slice(0, step).map((line) => (
                <div key={line.key}>{line.node(barFill)}</div>
            ))}
            {/* blinking cursor */}
            <div className="flex items-center">
                {step >= LINES.length && <span className="text-emerald-400 mr-1">❯ </span>}
                <span className="inline-block w-[7px] h-[13px] bg-slate-400 animate-pulse" />
            </div>
        </div>
    );
}
