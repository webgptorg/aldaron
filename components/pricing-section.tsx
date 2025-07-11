
'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, Crown, Facebook, Github, Linkedin, Mail, MessageSquare } from 'lucide-react';

export interface PricingSectionProps {
    hideHeader?: boolean;
}

const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-500', status: 'ready', isPreselected: true },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', status: 'preparing', isPreselected: false },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', status: 'preparing', isPreselected: false },
    { name: 'Google', icon: Mail, color: 'bg-red-500', status: 'preparing', isPreselected: false },
];

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Perfect for trying out your AI avatar',
        features: ['Website chatbot integration', 'Basic avatar training', 'Community support', 'Open source access'],
        buttonText: 'Get Started',
        popular: false,
        gradient: 'from-gray-500 to-gray-600',
    },
    {
        name: 'Pro',
        price: '$20',
        period: 'per month',
        description: 'Complete AI avatar solution for professionals',
        features: [
            'Everything in Free',
            'Email integration',
            'Social media management',
            'Audio/video agent',
            'Agentic background mode',
            'Priority support',
            'Advanced analytics',
        ],
        buttonText: 'Start Pro Trial',
        popular: true,
        gradient: 'from-purple-500 to-blue-500',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        description: 'Custom solutions for organizations',
        features: [
            'Everything in Pro',
            'Custom integrations',
            'Dedicated support',
            'On-premise deployment',
            'SLA guarantees',
            'Team management',
            'Custom training',
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

export function PricingSection({ hideHeader }: PricingSectionProps = {}) {
    // No modal or platform selection for PricingSection anymore
    const handleButtonClick = (buttonText: string) => {
        if (buttonText === 'Contact Sales') {
            window.location.href = 'mailto:sales@ptbk.io';
        }
    };

    return (
        <>
            <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-4">
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
                                Start free and scale as your AI avatar becomes an integral part of your workflow
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
                                    plan.popular
                                        ? 'border-primary scale-105 shadow-xl'
                                        : 'border-gray-100 hover:shadow-xl'
                                }`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
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

                                {/* Use a link for Get Started/Start Pro Trial, button for Contact Sales */}
                                {plan.buttonText === 'Get Started' || plan.buttonText === 'Start Pro Trial' ? (
                                    <a
                                        href="/get-started"
                                        className={`w-full inline-block text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                                            plan.popular
                                                ? 'bg-gradient-purple text-white hover:shadow-lg'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {plan.buttonText}
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => handleButtonClick(plan.buttonText)}
                                        className="w-full bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        {plan.buttonText}
                                    </button>
                                )}

                                {/* Subtle gradient overlay for popular plan */}
                                {plan.popular && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl pointer-events-none"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

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
                </div>
            </section>
        </>
    );
}
