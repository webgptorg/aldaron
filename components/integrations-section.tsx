'use client';

import { motion } from 'framer-motion';
import { Bot, Code, Mail, MessageSquare } from 'lucide-react';


type Integration = {
  
};


const integrations = [
    {
        icon: MessageSquare,
        title: 'Chat Apps',
        description: 'Create a chat shopping assistant for your eShop or a customer support bot.',
        features: ['24/7 availability', 'Personalized recommendations', 'Tightly controlled responses'],
    },
    {
        icon: Mail,
        title: 'Reply Agent',
        description: 'Automatically analyze and reply to emails, or create drafts for your review.',
        features: ['Auto-replies', 'Context awareness', 'Draft generation'],
    },
    {
        icon: Code,
        title: 'Coding Agent',
        description: 'Enforce your coding style and architecture rules in any vibecoding platform.',
        features: ['Custom coding standards', 'Architecture alignment', 'Security enforcement'],
    },
    {
        icon: Bot,
        title: 'Internal Expertise',
        description: 'Integrate AI into your internal apps for data analysis, sentiment analysis, and more.',
        features: ['Custom automations', 'Data analysis', 'Sentiment classification'],
    },
];

export function IntegrationsSection() {
    console.log('IntegrationsSection rendered');

    return (
        <section id="integrations" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Where to Use Your AI Agent
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Deploy your book-defined AI agents across a wide range of applications and scenarios.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {integrations.map((integration, index) => {
                        const Icon = integration.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden text-center"
                            >
                                <div className="mb-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{integration.title}</h3>

                                    <p className="text-gray-600">{integration.description}</p>
                                </div>

                                <div className="space-y-2">
                                    {integration.features.map((feature, featureIndex) => (
                                        <div
                                            key={featureIndex}
                                            className="flex items-center gap-2 text-sm text-gray-500"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                {/* Hover Gradient Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
