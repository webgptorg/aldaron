'use client';

import { motion } from 'framer-motion';
import { Book, Briefcase, Code, Shield, Zap, Users, LucideIcon } from 'lucide-react';
import { FC } from 'react';

const iconMap = {
    Briefcase,
    Shield,
    Zap,
    Book,
    Code,
    Users,
};

export interface Benefit {
    iconName: keyof typeof iconMap;
    title: string;
    description: string;
    gradient: string;
}

interface BenefitsSectionProps {
    title?: string;
    description?: string;
    benefits?: Benefit[];
}

const defaultBenefits: Benefit[] = [
    {
        iconName: 'Briefcase',
        title: 'Capture Company Context',
        description:
            'Easily define AI agents with specific knowledge, rules, and personalities that align with your company values.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        iconName: 'Shield',
        title: 'Reliable and Portable',
        description:
            'Books are explicit and easy to understand, ensuring your AI behaves predictably and consistently across all applications.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        iconName: 'Zap',
        title: 'Simple and Powerful',
        description:
            'Get the best of both worlds: the simplicity of no-code platforms and the deep control of heavy frameworks.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        iconName: 'Book',
        title: 'Commitments-Based Language',
        description:
            "Use Persona, Knowledge, Rule, and Action commitments to precisely define your AI agent's behavior.",
        gradient: 'from-orange-500 to-red-500',
    },
    {
        iconName: 'Code',
        title: 'Integrate Anywhere',
        description:
            'Use your book-defined AI agents in chat apps, reply agents, coding assistants, and internal applications.',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        iconName: 'Users',
        title: 'Tailored to Your Needs',
        description:
            'Create AI agents for any role, from customer support and marketing to legal and HR, ensuring they meet your specific requirements.',
        gradient: 'from-indigo-500 to-purple-500',
    },
];

export const BenefitsSection: FC<BenefitsSectionProps> = ({
    title = 'Transform Your Business with AI That Understands You',
    description = "Promptbook empowers you to build AI agents that are a true extension of your company's expertise and values.",
    benefits = defaultBenefits,
}) => {
    console.log('BenefitsSection rendered');

    return (
        <section id="benefits" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        {description}
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => {
                        const Icon = iconMap[benefit.iconName];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center"
                            >
                                <div className="flex justify-center mb-6">
                                    <div
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.gradient} flex items-center justify-center`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>

                                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
