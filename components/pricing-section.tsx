'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ArrowDown, Check, Crown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ElementType, useState } from 'react';

export interface PricingFootnote {
    id: string;
    text: string;
}

export interface PricingPlan {
    name: string;
    priceMonthly: string;
    priceYearly: string;
    currency: string;
    period: string;
    description: string;
    icon: ElementType;
    iconName: string;
    features: string[];
    buttonText: string;
    popular: boolean;
}

const iconColorMap: Record<string, string> = {
    Gift: 'bg-green-500',
    Zap: 'bg-yellow-500',
    Shield: 'bg-blue-500',
    Building: 'bg-purple-500',
    Users: 'bg-cyan-500',
    Search: 'bg-amber-500',
    Rocket: 'bg-pink-500',
};

export interface PricingSectionProps {
    hideHeader?: boolean;
    isFrame?: boolean;
    showBillingToggle?: boolean;
    /** Render plans as sequential stages instead of selectable side-by-side cards */
    stepsMode?: boolean;
    /** Group step plans into stages, e.g. [[0,1,2],[3],[4]] */
    stepsGroups?: number[][];
    /** Optional labels shown above grouped stages */
    stepsGroupLabels?: string[];
    /** Optional helper copy shown between grouped stages */
    stepsGroupTransitions?: string[];
    currentPlan?: 'FREE' | 'PRO' | 'ENTERPRISE' | 'STANDARD' | 'ADVANCED';
    plans: PricingPlan[];
    footnotes?: PricingFootnote[];
    title?: string;
    description?: string;
    monthlyText?: string;
    yearlyText?: string;
    openSourceGuaranteeText?: string;
    saveText?: string;
}

export function PricingSection({
    hideHeader,
    isFrame,
    showBillingToggle = true,
    stepsMode = false,
    stepsGroups,
    stepsGroupLabels = [],
    stepsGroupTransitions = [],
    currentPlan,
    plans,
    footnotes = [],
    title = 'Simple, Transparent Pricing',
    description = 'Choose the plan that fits your business needs.',
    monthlyText = 'Monthly',
    yearlyText = 'Yearly',
    openSourceGuaranteeText = 'All plans include our open-source guarantee - your data, your control, always.',
    saveText = 'Save',
}: PricingSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const router = useRouter();

    // Helper function to check if a plan is the current plan
    const isCurrentPlan = (planName: string) => {
        if (!currentPlan) return false;
        return planName.toUpperCase() === currentPlan.toUpperCase();
    };

    // Helper function to determine if a plan should show as popular
    const shouldShowAsPopular = (plan: PricingPlan) => {
        // If currentPlan is specified, don't show "Most Popular" for any plan
        if (currentPlan) return false;
        // Otherwise, use the original popular flag
        return plan.popular;
    };

    const handleButtonClick = (planName: string) => {
        const planSlug = planName.toLowerCase().replace(/\s+/g, '-');
        router.push(`?modal=get-started&plan=${encodeURIComponent(planSlug)}`, { scroll: false });
    };

    const groupedStepPlans =
        stepsGroups?.map((group) =>
            group
                .map((planIndex) => plans[planIndex])
                .filter((plan): plan is PricingPlan => Boolean(plan)),
        ) ?? [];

    const hasGroupedSteps = stepsMode && groupedStepPlans.length > 0;

    const renderStepsCard = (plan: PricingPlan) => {
        const isHighlighted = shouldShowAsPopular(plan) || isCurrentPlan(plan.name);

        return (
            <div
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 ${
                    isHighlighted
                        ? 'border-primary shadow-xl ring-1 ring-primary/10'
                        : 'border-gray-100 shadow-md hover:-translate-y-1 hover:shadow-xl'
                }`}
            >
                {isHighlighted && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
                )}

                <div className="relative flex h-full flex-col">
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                                    iconColorMap[plan.iconName] || 'bg-gray-500'
                                }`}
                            >
                                <plan.icon className="h-5 w-5 text-white" />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{plan.description}</p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 text-left sm:text-right">
                            <div className="text-2xl font-bold text-gray-900">
                                {plan.priceMonthly}
                                {plan.currency && ` ${plan.currency}`}
                            </div>
                            {plan.period && <div className="text-sm text-gray-500">{plan.period}</div>}
                        </div>
                    </div>

                    <ul className="mt-5 flex-grow space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                    <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm leading-relaxed text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleButtonClick(plan.name)}
                        className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
                            shouldShowAsPopular(plan)
                                ? 'bg-gradient-purple text-white hover:shadow-lg'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                    >
                        {plan.buttonText}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <section
                id="pricing"
                className={isFrame ? 'py-8 bg-white' : 'py-20 bg-gradient-to-br from-gray-50 to-blue-50'}
            >
                <div className={isFrame ? 'max-w-6xl mx-auto px-4' : 'container mx-auto px-4'}>
                    {!hideHeader && (
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
                        </div>
                    )}

                    {showBillingToggle && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <Label htmlFor="billing-cycle" className="text-muted-foreground">
                                {monthlyText}
                            </Label>
                            <Switch
                                id="billing-cycle"
                                checked={billingCycle === 'yearly'}
                                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                            />
                            <Label htmlFor="billing-cycle" className="text-muted-foreground">
                                {yearlyText}
                            </Label>
                        </div>
                    )}

                    {/* ── Steps mode: sequential stages ── */}
                    {hasGroupedSteps && (
                        <div className="mt-12 mx-auto max-w-6xl">
                            {groupedStepPlans.map((group, stageIndex) => {
                                const isLastStage = stageIndex === groupedStepPlans.length - 1;
                                const stageLabel = stepsGroupLabels[stageIndex];
                                const transitionText = stepsGroupTransitions[stageIndex];

                                return (
                                    <div key={`stage-${stageIndex}`} className="relative">
                                        <div className="mb-6 flex flex-col items-center text-center">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg ${
                                                    stageIndex === 0
                                                        ? 'bg-blue-500'
                                                        : stageIndex === 1
                                                          ? 'bg-indigo-600'
                                                          : 'bg-purple-600'
                                                }`}
                                            >
                                                {stageIndex + 1}
                                            </div>

                                            {stageLabel && (
                                                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-700">
                                                    {stageLabel}
                                                </p>
                                            )}
                                        </div>

                                        <div className={group.length === 1 ? 'mx-auto w-full max-w-2xl' : 'grid gap-6 md:grid-cols-2 xl:grid-cols-3'}>
                                            {group.map((plan, planIndex) => (
                                                <motion.div
                                                    key={`${plan.name}-${stageIndex}-${planIndex}`}
                                                    initial={{ opacity: 0, y: 24 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: stageIndex * 0.12 + planIndex * 0.08 }}
                                                    className={group.length === 1 ? 'w-full' : undefined}
                                                >
                                                    {renderStepsCard(plan)}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {!isLastStage && (
                                            <div className="my-8 flex flex-col items-center gap-3 text-center">
                                                {transitionText && (
                                                    <p className="max-w-2xl rounded-full border border-indigo-100 bg-white/90 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                                                        {transitionText}
                                                    </p>
                                                )}

                                                <div className="flex flex-col items-center">
                                                    <div className="h-12 w-px bg-gradient-to-b from-cyan-300 via-indigo-300 to-purple-400" />
                                                    <ArrowDown className="h-5 w-5 text-indigo-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {stepsMode && !hasGroupedSteps && (
                        <div className="mt-12 max-w-3xl mx-auto space-y-0">
                            {plans.map((plan, index) => {
                                const isLast = index === plans.length - 1;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.15 }}
                                        className="relative flex gap-6"
                                    >
                                        {/* Step number + connector */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white z-10 ${
                                                    index === 0
                                                        ? 'bg-blue-500'
                                                        : index === 1
                                                          ? 'bg-indigo-600'
                                                          : 'bg-purple-600'
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                            {!isLast && (
                                                <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-300 to-purple-300 my-1" />
                                            )}
                                        </div>

                                        {/* Card */}
                                        <div
                                            className={`flex-1 bg-white rounded-2xl p-6 shadow-md border border-gray-100 ${!isLast ? 'mb-6' : ''}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-xl ${
                                                            iconColorMap[plan.iconName] || 'bg-gray-500'
                                                        } flex items-center justify-center flex-shrink-0`}
                                                    >
                                                        <plan.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                                        <p className="text-sm text-gray-500">{plan.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {plan.priceMonthly}
                                                        {plan.currency && ` ${plan.currency}`}
                                                    </span>
                                                    {plan.period && (
                                                        <span className="text-gray-500 text-sm ml-1">
                                                            / {plan.period}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <ul className="space-y-2 mb-5">
                                                {plan.features.map((feature, fi) => (
                                                    <li key={fi} className="flex items-start gap-2.5">
                                                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Check className="w-2.5 h-2.5 text-green-600" />
                                                        </div>
                                                        <span className="text-sm text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                onClick={() => handleButtonClick(plan.name)}
                                                className={`py-2.5 px-5 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                                                    index === 0
                                                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {plan.buttonText}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Default grid mode ── */}
                    {!stepsMode && (
                        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan, index) => {
                                const price = showBillingToggle
                                    ? billingCycle === 'yearly'
                                        ? plan.priceYearly
                                        : plan.priceMonthly
                                    : plan.priceMonthly;
                                const monthlyPrice = parseFloat(plan.priceMonthly.replace(/[^0-9.]/g, ''));
                                const yearlyPrice = parseFloat(plan.priceYearly.replace(/[^0-9.]/g, ''));
                                const discount =
                                    showBillingToggle && monthlyPrice && yearlyPrice
                                        ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
                                        : 0;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className={`relative flex flex-col bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 ${
                                            shouldShowAsPopular(plan) || isCurrentPlan(plan.name)
                                                ? 'border-primary scale-105 shadow-xl'
                                                : 'border-gray-100 hover:shadow-xl'
                                        }`}
                                    >
                                        {/* Current Plan Badge */}
                                        {isCurrentPlan(plan.name) && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                <Badge className="bg-green-500 text-white px-4 py-2">
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Current Plan
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Popular Badge */}
                                        {shouldShowAsPopular(plan) && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                <Badge className="bg-gradient-purple text-white px-4 py-2">
                                                    <Crown className="w-4 h-4 mr-1" />
                                                    Most Popular
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="text-center mb-8">
                                            <div
                                                className={`w-16 h-16 rounded-2xl ${
                                                    iconColorMap[plan.iconName] || 'bg-gray-500'
                                                } flex items-center justify-center mx-auto mb-4`}
                                            >
                                                <plan.icon className="w-8 h-8 text-white" />
                                            </div>

                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <p className="text-gray-600 mb-4">{plan.description}</p>

                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-900">
                                                    {price}
                                                    {plan.currency && ` ${plan.currency}`}
                                                </span>
                                                {showBillingToggle ? (
                                                    <span className="text-gray-500 ml-2">
                                                        / {billingCycle === 'yearly' ? yearlyText : monthlyText}
                                                    </span>
                                                ) : (
                                                    plan.period && (
                                                        <span className="text-gray-500 ml-2">/ {plan.period}</span>
                                                    )
                                                )}
                                                {showBillingToggle && billingCycle === 'yearly' && discount > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {saveText} {discount}%
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-4 mb-8">
                                            {plan.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-green-600" />
                                                    </div>
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Hide CTA button for current plan */}
                                        {!isCurrentPlan(plan.name) && (
                                            <>
                                                {/* Handle all buttons with consistent behavior */}
                                                {plan.buttonText === 'Start Pro Trial' && isFrame ? (
                                                    <Link
                                                        target="_top"
                                                        href="https://promptbook.studio/purchase?plan=PRO"
                                                        className={`w-full inline-block text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                                                            shouldShowAsPopular(plan)
                                                                ? 'bg-gradient-purple text-white hover:shadow-lg'
                                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {plan.buttonText}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => handleButtonClick(plan.name)}
                                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                                                            plan.buttonText === 'Contact Sales'
                                                                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                                                : shouldShowAsPopular(plan)
                                                                  ? 'bg-gradient-purple text-white hover:shadow-lg'
                                                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {plan.buttonText}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {/* Subtle gradient overlay for popular plan or current plan */}
                                        {(shouldShowAsPopular(plan) || isCurrentPlan(plan.name)) && (
                                            <div
                                                className={`absolute inset-0 rounded-2xl pointer-events-none ${
                                                    isCurrentPlan(plan.name)
                                                        ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5'
                                                        : 'bg-gradient-to-r from-purple-500/5 to-blue-500/5'
                                                }`}
                                            ></div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {footnotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-8 max-w-4xl mx-auto"
                        >
                            <div className="text-sm text-gray-500 space-y-1">
                                {footnotes.map((footnote) => (
                                    <p key={footnote.id}>
                                        <span className="font-medium">{footnote.id}</span> {footnote.text}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {!hideHeader && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-center mt-12"
                        >
                            <p className="text-gray-600">{openSourceGuaranteeText}</p>
                        </motion.div>
                    )}
                </div>
            </section>
        </>
    );
}
