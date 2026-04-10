'use client';

import type { PricingFootnote } from '@/components/pricing-section';
import type { AiSupervizeJourneyPlan } from '@/config/ai-supervize/aiSupervizePricing';
import { motion } from 'framer-motion';
import { ArrowDown, Check } from 'lucide-react';
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

const stageCopy = {
    1: {
        label: '1. Vyberte první krok',
        description: 'Podle situace můžete začít společným školením, týmovým workshopem nebo užším discovery blokem s technickým vedením.',
    },
    2: {
        label: '2. AI Supervize',
        description: 'Vstupní krok se propíše do konkrétního návrhu workflow, pravidel, šablon a metrik pro váš tým.',
    },
    3: {
        label: '3. Follow-up',
        description: 'Po zavedení navazujeme průběžnou supervizí, aby se změna udržela i v každodenním delivery.',
    },
} as const;

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

    const handleButtonClick = (planName: string) => {
        router.push(`?modal=get-started&plan=${encodeURIComponent(planName)}`, { scroll: false });
    };

    const renderPlanCard = (plan: AiSupervizeJourneyPlan, emphasized = false) => (
        <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex h-full flex-col rounded-3xl border bg-white p-6 shadow-md transition-all duration-300 ${
                emphasized ? 'border-indigo-200 shadow-xl' : 'border-gray-100 hover:shadow-xl'
            }`}
        >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                            iconColorMap[plan.iconName] || 'bg-gray-500'
                        }`}
                    >
                        <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <div className="text-3xl font-bold text-gray-900">
                        {plan.priceMonthly}
                        {plan.currency && ` ${plan.currency}`}
                    </div>
                    {plan.period && <div className="text-sm text-gray-500">/ {plan.period}</div>}
                </div>
            </div>

            <div className="mb-6 flex-grow space-y-3">
                {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => handleButtonClick(plan.name)}
                className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    emphasized
                        ? 'bg-gradient-purple text-white hover:shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
            >
                {plan.buttonText}
            </button>
        </motion.div>
    );

    return (
        <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{description}</p>
                </div>

                <div className="mt-12 space-y-8">
                    <div className="space-y-5">
                        <div className="text-center">
                            <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900">
                                {stageCopy[1].label}
                            </div>
                            <p className="mx-auto mt-3 max-w-3xl text-sm text-gray-600">{stageCopy[1].description}</p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {entryPlans.map((plan) => renderPlanCard(plan))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="mx-auto max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-4 text-center text-sm font-medium text-indigo-900">
                            {entryStepNote}
                        </div>
                        <div className="flex justify-center text-indigo-500">
                            <ArrowDown className="h-6 w-6" />
                        </div>
                    </div>

                    {supervizePlan && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-900">
                                    {stageCopy[2].label}
                                </div>
                                <p className="mx-auto mt-3 max-w-3xl text-sm text-gray-600">
                                    {stageCopy[2].description}
                                </p>
                            </div>

                            <div className="mx-auto max-w-3xl">{renderPlanCard(supervizePlan, true)}</div>
                        </div>
                    )}

                    {followUpPlan && (
                        <>
                            <div className="space-y-4">
                                <div className="mx-auto max-w-3xl rounded-2xl border border-purple-200 bg-white px-6 py-4 text-center text-sm font-medium text-gray-700 shadow-sm">
                                    {followUpNote}
                                </div>
                                <div className="flex justify-center text-purple-500">
                                    <ArrowDown className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="text-center">
                                    <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
                                        {stageCopy[3].label}
                                    </div>
                                    <p className="mx-auto mt-3 max-w-3xl text-sm text-gray-600">
                                        {stageCopy[3].description}
                                    </p>
                                </div>

                                <div className="mx-auto max-w-2xl">{renderPlanCard(followUpPlan)}</div>
                            </div>
                        </>
                    )}
                </div>

                {footnotes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-8 mx-auto max-w-4xl"
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
