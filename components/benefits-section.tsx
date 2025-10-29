'use client';

import { motion } from 'framer-motion';
import { Book, Briefcase, Code, Shield, Users, Zap } from 'lucide-react';
import { FC } from 'react';
import { defaultBenefits } from '../config/_generic/defaultBenefits';

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

export const BenefitsSection: FC<BenefitsSectionProps> = ({
    title = 'Transform Your Business with AI That Understands You',
    description = "Promptbook empowers you to build AI agents that are a true extension of your company's expertise and values.",
    benefits = defaultBenefits,
}) => {
    console.log('BenefitsSection rendered');

    return (
        <section id="benefits" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{description}</p>
                </div>

                <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
