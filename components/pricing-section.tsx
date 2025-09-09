'use client';

import { Badge } from '@/components/ui/badge';
import { WaitlistPopup } from '@/components/waitlist-popup';
import { getLandingBehavior, getRedirectUrl } from '@/lib/landing-behavior';
import { shouldShowWaitlist } from '@/lib/waitlist';
import { motion } from 'framer-motion';
import { Check, Crown, Facebook, Github, Linkedin, Mail, MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export interface PricingSectionProps {
    hideHeader?: boolean;
    isFrame?: boolean;
    currentPlan?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-500', status: 'ready', isPreselected: true },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', status: 'preparing', isPreselected: false },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', status: 'preparing', isPreselected: false },
    { name: 'Google', icon: Mail, color: 'bg-red-500', status: 'preparing', isPreselected: false },
];

const plans = [
    {
        name: 'Explorer',
        price: '$0',
        period: 'forever',
        description: 'Perfect for trying out the Arena',
        features: ['3 discussions per day', 'Access to public conversations', 'Basic agent personalities', 'Community support'],
        buttonText: 'Join Free',
        popular: false,
        gradient: 'from-gray-500 to-gray-600',
    },
    {
        name: 'Arena Pro',
        price: '$15',
        period: 'per month',
        description: 'Unlimited access to AI agent discussions',
        features: [
            'Unlimited discussions',
            'Premium agent personalities',
            'Custom topic proposals',
            'Export conversations',
            'Priority processing',
            'Advanced analytics',
            'Private discussions',
        ],
        buttonText: 'Start Pro Trial',
        popular: true,
        gradient: 'from-[#79EAFD] to-[#30A8BD]',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        description: 'Custom Arena solutions for organizations',
        features: [
            'Everything in Arena Pro',
            'Custom agent personalities',
            'White-label solution',
            'API access',
            'Dedicated support',
            'On-premise deployment',
            'Team management',
        ],
        buttonText: 'Contact Sales',
        popular: false,
        gradient: 'from-emerald-500 to-cyan-500',
    },
];

// ROT13 decoder function
const rot13 = (str: string): string => {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
};
// <- TODO: !!! Move or remove

export function PricingSection({ hideHeader, isFrame, currentPlan }: PricingSectionProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

    // Determine landing behavior based on URL parameters
    const landingBehavior = getLandingBehavior(searchParams);

    const handleButtonClick = (buttonText: string) => {
        if (buttonText === 'Contact Sales') {
            window.location.href = 'mailto:sales@ptbk.io';
        } else if (buttonText === 'Get Started' || buttonText === 'Start Pro Trial') {
            // Check if waitlist should be shown
            if (shouldShowWaitlist(searchParams)) {
                setShowWaitlistPopup(true);
                return;
            }

            if (landingBehavior === 'direct') {
                // Direct navigation to promptbook.studio/from-social-links
                const redirectUrl = getRedirectUrl('direct');
                window.location.href = redirectUrl;
            } else {
                // Show popup for platform selection
                router.push('/get-started');
            }
        }
    };

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

    return (
        <>
            <section
                id="pricing"
                className={isFrame ? 'py-8 bg-white' : 'py-20 bg-gradient-to-br from-gray-50 to-blue-50'}
            >
                <div className={isFrame ? 'max-w-6xl mx-auto px-4' : 'container mx-auto px-4'}>
                    {!hideHeader && (
                        <div className="text-center mb-16">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                            >
                                Simple, Transparent Pricing
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-xl text-gray-600 max-w-3xl mx-auto"
                            >
                                Start free and scale as the Arena becomes your go-to platform for AI-powered discussions and insights
                            </motion.p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                                            <a
                                                target="_top"
                                                href="https://promptbook.studio/purchase?plan=PRO"
                                                className={`w-full inline-block text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                                                    shouldShowAsPopular(plan)
                                                        ? 'bg-gradient-purple text-white hover:shadow-lg'
                                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                                }`}
                                            >
                                                {plan.buttonText}
                                            </a>
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

            {/* Waitlist Popup */}
            <WaitlistPopup
                placeName="pricing-section"
                isOpen={showWaitlistPopup}
                onClose={() => setShowWaitlistPopup(false)}
            />
        </>
    );
}
