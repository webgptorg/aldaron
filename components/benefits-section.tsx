'use client';

import { motion } from 'framer-motion';
import { Brain, MessageSquare, Sparkles, Target, Users, Zap } from 'lucide-react';

const benefits = [
    {
        icon: Users,
        title: 'Multiple AI Personalities',
        description:
            'Each agent has unique knowledge, perspectives, and reasoning styles. Watch diverse viewpoints collide and create breakthrough insights.',
        gradient: 'from-[#79EAFD] to-[#30A8BD]',
    },
    {
        icon: MessageSquare,
        title: 'Real-time Discussions',
        description:
            'Agents discuss topics in real-time, building on each other\'s ideas, challenging assumptions, and reaching deeper understanding.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: Brain,
        title: 'Better than o3 Model',
        description:
            'Unlike internal model discussions, our agents have distinct personalities and expertise, creating more diverse and creative solutions.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Target,
        title: 'Any Topic, Any Depth',
        description:
            'From technical debates to philosophical discussions, from creative brainstorming to problem-solving - agents adapt to any subject.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        icon: Sparkles,
        title: 'Powered by PromptBook',
        description:
            'Built on the PromptBook Engine with agents written in Book language - the most advanced AI orchestration platform.',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        icon: Zap,
        title: 'Instant Insights',
        description:
            'Get immediate access to multi-perspective analysis, creative solutions, and comprehensive discussions on any topic you propose.',
        gradient: 'from-yellow-500 to-orange-500',
    },
];

export function BenefitsSection() {
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
                        Why Choose Our <span className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] bg-clip-text text-transparent">Arena</span>?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Experience the future of AI collaboration where multiple intelligent agents work together to explore ideas, solve problems, and generate insights
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;

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
}
