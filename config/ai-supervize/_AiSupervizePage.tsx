'use client';

import { BenefitsSection } from '@/components/benefits-section';
import { BusinessGetStartedModal } from '@/components/business-get-started-modal';
import { FeatureCardsSection } from '@/components/feature-cards-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { PlaygroundSection } from '@/components/playground-section';
import { PricingSection } from '@/components/pricing-section';
import { TeamSection } from '@/components/team-section';
import { Button } from '@/components/ui/button';
import { czechBusinessFooterProps } from '@/config/_generic/czechBusinessFooterProps';
import { aiSupervizeBenefits } from '@/config/ai-supervize/aiSupervizeBenefits';
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
import { Suspense } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
                                        Pomáháme CTO, CEO a Tech Leadům nastavit workflow, pravidla, nástroje a měření
                                        tak, aby AI zkracovala time-to-merge, snižovala rework a nezvyšovala chaos.
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
                                <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-3">
                                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                    <span className="ml-2 flex-1 text-center font-mono text-xs text-slate-400">
                                        ai-supervize — metrics
                                    </span>
                                </div>

                                {/* ── Terminal body ── */}
                                <div className="space-y-4 p-5 font-mono">
                                    {/* command line */}
                                    <p className="text-xs">
                                        <span className="text-emerald-400">❯ </span>
                                        <span className="text-slate-300">ai-supervize analyze</span>
                                        <span className="text-cyan-400"> --sprint 12 --compare baseline</span>
                                    </p>

                                    {/* output header */}
                                    <p className="text-xs text-slate-500">
                                        # Průměrný dopad · před vs. po zavedení AI Supervize
                                    </p>

                                    <SupervizeImpactChart />

                                    {/* legend */}
                                    <div className="flex items-center gap-6 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block h-2 w-2 rounded-sm bg-slate-600" />
                                            before
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="inline-block h-2 w-2 rounded-sm bg-cyan-400" />
                                            after
                                        </span>
                                    </div>

                                    {/* summary rows */}
                                    <div className="space-y-1 border-t border-slate-800 pt-3 text-xs">
                                        {chartData.map((row) => (
                                            <div key={row.metric} className="flex items-center gap-2">
                                                <span className="text-emerald-400">✓</span>
                                                <span className="w-28 text-slate-400">{row.metric}</span>
                                                <span className="text-slate-500">
                                                    {row.before}
                                                    {row.unit}
                                                </span>
                                                <span className="text-slate-600">→</span>
                                                <span className="text-cyan-300">
                                                    {row.after}
                                                    {row.unit}
                                                </span>
                                                <span className="ml-auto text-emerald-400">
                                                    −{Math.round((1 - row.after / row.before) * 100)}&nbsp;%
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* cursor prompt */}
                                    <p className="flex items-center gap-1 text-xs text-slate-500">
                                        <span className="text-emerald-400">❯</span>
                                        <span className="inline-block h-3.5 w-1.5 animate-pulse bg-slate-400" />
                                    </p>
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
                    title="Ceník AI Supervize"
                    description="Začít můžete discovery workshopem. Pokud dává smysl pokračovat, navážeme návrhem, nastavením a případným follow-up režimem."
                    plans={aiSupervizePricing}
                    footnotes={aiSupervizePricingFootnotes}
                    showBillingToggle={false}
                    openSourceGuaranteeText="Nezačínáte nákupem dalšího AI toolu. Začínáte rozhodnutím, kde má AI ve vašem vývoji skutečně fungovat."
                />

                {isLocalhost && <PlaygroundSection />}

                <Footer {...czechBusinessFooterProps} />
            </main>
        </>
    );
}

// ── Benefit chart ──────────────────────────────────────────────────────────────

const chartData = [
    { metric: 'Čas do merge', before: 5.2, after: 3.1, unit: ' dny' },
    { metric: 'Rework kódu', before: 28, after: 15, unit: ' %' },
    { metric: 'Code review', before: 3.8, after: 2.2, unit: ' hod' },
    { metric: 'Bugy / sprint', before: 8, after: 4, unit: '' },
];

type TooltipPayloadItem = {
    name: string;
    value: number;
    dataKey: string;
};

function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const row = chartData.find((d) => d.metric === label);
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-xs shadow-xl font-mono">
            <p className="mb-2 text-slate-300">
                <span className="text-emerald-400">✓ </span>
                {label}
            </p>
            {payload.map((p) => (
                <p key={p.dataKey} className="flex gap-2">
                    <span className="text-slate-500">{p.dataKey === 'before' ? 'before' : 'after '}:</span>
                    <span style={{ color: p.dataKey === 'after' ? '#22d3ee' : 'rgba(255,255,255,0.45)' }}>
                        {p.value}
                        {row?.unit}
                    </span>
                </p>
            ))}
            {row && (
                <p className="mt-1.5 text-emerald-400">diff: −{Math.round((1 - row.after / row.before) * 100)} %</p>
            )}
        </div>
    );
}

function SupervizeImpactChart() {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart
                data={chartData}
                layout="vertical"
                barCategoryGap="30%"
                barGap={3}
                margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="2 4" stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="metric"
                    width={96}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />

                {/* Before bar */}
                <Bar dataKey="before" radius={[0, 3, 3, 0]} maxBarSize={11}>
                    {chartData.map((entry) => (
                        <Cell key={entry.metric} fill="rgba(100,116,139,0.35)" />
                    ))}
                </Bar>

                {/* After bar */}
                <Bar dataKey="after" radius={[0, 3, 3, 0]} maxBarSize={11}>
                    {chartData.map((entry) => (
                        <Cell key={entry.metric} fill="#22d3ee" />
                    ))}
                    <LabelList
                        dataKey="after"
                        position="right"
                        formatter={(value: number) => {
                            const row = chartData.find((d) => d.after === value);
                            return row ? `−${Math.round((1 - row.after / row.before) * 100)}%` : '';
                        }}
                        style={{ fill: '#34d399', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
