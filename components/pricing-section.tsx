'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, Crown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export interface PricingPlan {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    popular: boolean;
    gradient: string;
}

export interface PricingSectionProps {
    hideHeader?: boolean;
    isFrame?: boolean;
    currentPlan?: 'FREE' | 'PRO' | 'ENTERPRISE' | 'STANDARD' | 'ADVANCED';
    plans: PricingPlan[];
    title?: string;
    description?: string;
}

export function PricingSection({
    hideHeader,
    isFrame,
    currentPlan,
    plans,
    title = 'Simple, Transparent Pricing',
    description = 'Choose the plan that fits your business needs.',
}: PricingSectionProps) {
    // Helper function to check if a plan is the current plan
    const isCurrentPlan = (planName: string) => {
        if (!currentPlan) return false;
        return planName.toUpperCase() === currentPlan.toUpperCase();
    };

    // Helper function to determine if a plan should show as popular
    const shouldShowAsPopular = (plan: any) => {
        // If currentPlan is specified, don't show "Most Popular" for any plan
        if (currentPlan) return false;
        // Otherwise, use the original popular flag
        return plan.popular;
    };

    const handleButtonClick = (buttonText: string) => {
        // TODO: Implement actual logic for buttons
        console.log(`${buttonText} clicked`);
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

                    <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className={`relative bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 ${
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
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4`}
                                    >
                                        <MessageSquare className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 mb-4">{plan.description}</p>

                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500 ml-2">/{plan.period}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
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
                                                onClick={() => handleButtonClick(plan.buttonText)}
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
                        ))}
                    </div>

                    {!hideHeader && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-center mt-12"
                        >
                            <p className="text-gray-600">
                                All plans include our open-source guarantee - your data, your control, always.
                            </p>
                        </motion.div>
                    )}
                </div>
            </section>
        </>
    );
}
