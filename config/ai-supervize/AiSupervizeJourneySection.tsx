'use client';

import type { PricingFootnote } from '@/components/pricing-section';
import type { AiSupervizeJourneyPlan } from '@/config/ai-supervize/aiSupervizePricing';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AiSupervizeJourneySectionProps {
    title: string;
    description: string;
    plans: AiSupervizeJourneyPlan[];
    footnotes?: PricingFootnote[];
    entryStepNote?: string;
    followUpNote?: string;
    closingText?: string;
}

const iconColorMap: Record<string, string> = {
    Building: 'bg-purple-500',
    Users: 'bg-emerald-500',
    Search: 'bg-sky-500',
    Rocket: 'bg-indigo-600',
    Shield: 'bg-blue-500',
};

const cardAccentMap: Record<string, string> = {
    Building: 'from-fuchsia-500 via-violet-500 to-indigo-500',
    Users: 'from-emerald-500 via-teal-500 to-cyan-500',
    Search: 'from-sky-500 via-blue-500 to-indigo-500',
    Rocket: 'from-indigo-600 via-violet-600 to-fuchsia-500',
    Shield: 'from-sky-500 via-blue-500 to-cyan-500',
};

const stageBadgeStyleMap: Record<1 | 2 | 3, string> = {
    1: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    2: 'border-violet-200 bg-violet-50 text-violet-900',
    3: 'border-sky-200 bg-sky-50 text-sky-900',
};

const stagePanelStyleMap: Record<1 | 2 | 3, string> = {
    1: 'border-indigo-100 bg-white/85 shadow-xl shadow-indigo-100/70',
    2: 'border-violet-100 bg-white/90 shadow-xl shadow-violet-100/70',
    3: 'border-sky-100 bg-white/90 shadow-xl shadow-sky-100/70',
};

const planBadgeStyleMap: Record<1 | 2 | 3, string> = {
    1: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    2: 'border-violet-200 bg-violet-50 text-violet-900',
    3: 'border-sky-200 bg-sky-50 text-sky-900',
};

const stageCopy = {
    1: {
        label: '1. První krok',
        heading: 'Začněte školením, workshopem nebo discovery blokem',
        description:
            'Podle situace můžete srovnat celý tým školením ve firmě, otevřít konkrétní use-case online workshopem nebo si nejdřív ujasnit směr s CTO či Tech Leadem.',
    },
    2: {
        label: '2. AI Supervize',
        heading: 'Navážeme konkrétním návrhem pro váš vývojový tým',
        description:
            'Vstupní krok proměníme v jasný adoption plan, pravidla, šablony, doporučení pro tooling i způsob, jak měřit dopad na delivery.',
    },
    3: {
        label: '3. Follow-up',
        heading: 'Udržíme změnu i po zavedení do praxe',
        description:
            'Po zavedení navazujeme pravidelnou supervizí, aby AI ve workflow fungovala dlouhodobě a nevyprchala po prvním nadšení.',
    },
} as const;

function formatPlanPrice(plan?: AiSupervizeJourneyPlan): string {
    if (!plan) {
        return '';
    }

    return `${plan.priceMonthly}${plan.currency ? ` ${plan.currency}` : ''}`;
}

export function AiSupervizeJourneySection({
    title,
    description,
    plans,
    footnotes = [],
    entryStepNote = 'Cena zvoleného prvního kroku se při pokračování odečítá z ceny AI Supervize.',
    followUpNote = 'Po zavedení navazujeme pravidelným follow-upem a dolaďováním workflow podle reality týmu.',
    closingText = 'Nezačínáte nákupem dalšího AI toolu. Začínáte rozhodnutím, kde má AI ve vašem vývoji skutečně fungovat.',
}: AiSupervizeJourneySectionProps) {
    const router = useRouter();

    const entryPlans = plans.filter((plan) => plan.stage === 1);
    const supervizePlan = plans.find((plan) => plan.stage === 2);
    const followUpPlan = plans.find((plan) => plan.stage === 3);
    const supervizePriceLabel = formatPlanPrice(supervizePlan) || '80 000 Kč';
    const hasFullJourney = Boolean(supervizePlan && followUpPlan);

    const handleButtonClick = (planName: string) => {
        router.push(`?modal=get-started&plan=${encodeURIComponent(planName)}`, { scroll: false });
    };

    const renderPlanCard = (
        plan: AiSupervizeJourneyPlan,
        options: {
            emphasized?: boolean;
            delay?: number;
        } = {}
    ) => {
        const { emphasized = false, delay = 0 } = options;
        const isEntry = plan.stage === 1;
        const accent = cardAccentMap[plan.iconName] || 'from-slate-500 to-slate-700';
        const iconColor = iconColorMap[plan.iconName] || 'bg-gray-500';
        const planBadgeText =
            plan.stage === 1 ? 'Vstupní varianta' : plan.stage === 2 ? 'Hlavní krok' : 'Navazující péče';

        return (
            <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-white/95 p-6 transition-all duration-300 ${
                    emphasized
                        ? 'border-violet-200 shadow-2xl shadow-violet-200/60'
                        : 'border-white/80 shadow-lg shadow-slate-200/70 hover:-translate-y-1 hover:shadow-xl'
                }`}
            >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-4">
                        <div
                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                planBadgeStyleMap[plan.stage]
                            }`}
                        >
                            {planBadgeText}
                        </div>

                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${iconColor}`}
                            >
                                <plan.icon className="h-6 w-6 text-white" />
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                                <p className="mt-2 text-sm leading-6 text-gray-600">{plan.description}</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`rounded-2xl border px-4 py-3 text-left sm:text-right ${
                            emphasized ? 'border-violet-200 bg-violet-50/80' : 'border-slate-200 bg-slate-50/80'
                        }`}
                    >
                        <div className="text-3xl font-black tracking-tight text-gray-900">
                            {plan.priceMonthly}
                            {plan.currency && <span className="ml-1 text-xl font-bold">{plan.currency}</span>}
                        </div>

                        {plan.period && <div className="mt-1 text-sm font-medium text-gray-500">{plan.period}</div>}
                    </div>
                </div>

                {isEntry && (
                    <div className="mt-5 inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                        Při pokračování odečítáme z ceny AI Supervize
                    </div>
                )}

                <div className="mt-6 flex-grow space-y-3">
                    {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm leading-6 text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => handleButtonClick(plan.name)}
                    className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                        emphasized
                            ? 'bg-gradient-purple text-white hover:shadow-lg'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                    {plan.buttonText}
                </button>
            </motion.div>
        );
    };

    return (
        <section id="pricing" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-20">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
            <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="absolute -right-24 bottom-12 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="container relative mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{description}</p>
                </div>

                <div className="mt-12 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`rounded-[32px] border p-6 backdrop-blur sm:p-8 ${stagePanelStyleMap[1]}`}
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <div
                                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${stageBadgeStyleMap[1]}`}
                                >
                                    {stageCopy[1].label}
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-gray-900">{stageCopy[1].heading}</h3>
                                <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                                    {stageCopy[1].description}
                                </p>
                            </div>

                            <div className="max-w-md rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm font-medium leading-6 text-indigo-950 shadow-sm">
                                {entryStepNote}
                            </div>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            {entryPlans.map((plan, index) => renderPlanCard(plan, { delay: index * 0.08 }))}
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative mt-8 h-14">
                                <div className="absolute left-[16.666%] top-0 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-indigo-200 to-violet-300" />
                                <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-200 to-violet-400" />
                                <div className="absolute left-[83.333%] top-0 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-sky-200 to-violet-300" />
                                <div className="absolute left-[16.666%] right-[16.666%] top-8 h-px bg-gradient-to-r from-indigo-200 via-violet-400 to-sky-300" />
                                <div className="absolute left-1/2 top-8 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-violet-500 to-violet-600" />
                            </div>

                            <div className="flex justify-center text-violet-500">
                                <ArrowDown className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center text-violet-500 lg:hidden">
                            <ArrowDown className="h-6 w-6" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="mx-auto max-w-3xl rounded-[28px] border border-violet-200 bg-white/90 px-6 py-5 text-center shadow-lg shadow-violet-100/70"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
                            Cena AI Supervize po odpočtu
                        </p>
                        <p className="mt-3 text-lg font-semibold text-gray-900 sm:text-xl">
                            {supervizePriceLabel} - cena školení, online workshopu nebo discovery workshopu
                        </p>
                    </motion.div>

                    <div className="flex justify-center text-violet-500">
                        <ArrowDown className="h-6 w-6" />
                    </div>

                    <div
                        className={`grid gap-6 ${
                            hasFullJourney
                                ? 'xl:grid-cols-[minmax(0,1.2fr)_72px_minmax(0,0.9fr)] xl:items-stretch'
                                : ''
                        }`}
                    >
                        {supervizePlan && (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`rounded-[32px] border p-6 sm:p-8 ${stagePanelStyleMap[2]}`}
                            >
                                <div className="mb-6 max-w-3xl">
                                    <div
                                        className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${stageBadgeStyleMap[2]}`}
                                    >
                                        {stageCopy[2].label}
                                    </div>
                                    <h3 className="mt-4 text-2xl font-bold text-gray-900">{stageCopy[2].heading}</h3>
                                    <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                                        {stageCopy[2].description}
                                    </p>
                                </div>

                                {renderPlanCard(supervizePlan, { emphasized: true, delay: 0.12 })}
                            </motion.div>
                        )}

                        {hasFullJourney && (
                            <div className="hidden xl:flex items-center justify-center">
                                <div className="h-px w-full bg-gradient-to-r from-violet-300 via-indigo-400 to-sky-400" />
                                <ArrowRight className="-ml-3 h-6 w-6 flex-shrink-0 text-sky-500" />
                            </div>
                        )}

                        {followUpPlan && (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.16 }}
                                className={`rounded-[32px] border p-6 sm:p-8 ${stagePanelStyleMap[3]}`}
                            >
                                <div className="mb-6">
                                    <div
                                        className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${stageBadgeStyleMap[3]}`}
                                    >
                                        {stageCopy[3].label}
                                    </div>
                                    <h3 className="mt-4 text-2xl font-bold text-gray-900">{stageCopy[3].heading}</h3>
                                    <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
                                        {stageCopy[3].description}
                                    </p>

                                    <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-5 py-4 text-sm font-medium leading-6 text-gray-700 shadow-sm">
                                        {followUpNote}
                                    </div>
                                </div>

                                {supervizePlan && (
                                    <div className="mb-6 flex justify-center text-sky-500 xl:hidden">
                                        <ArrowDown className="h-6 w-6" />
                                    </div>
                                )}

                                {renderPlanCard(followUpPlan, { delay: 0.18 })}
                            </motion.div>
                        )}
                    </div>
                </div>

                {footnotes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mx-auto mt-8 max-w-4xl"
                    >
                        <div className="space-y-1 text-sm text-gray-500">
                            {footnotes.map((footnote) => (
                                <p key={footnote.id}>
                                    <span className="font-medium">{footnote.id}</span> {footnote.text}
                                </p>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600">{closingText}</p>
                </motion.div>
            </div>
        </section>
    );
}
