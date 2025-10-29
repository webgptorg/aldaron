'use client';

import { motion } from 'framer-motion';
import { defaultIntegrations } from '../config/_generic/defaultIntegrations';

export type Integration = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    features: string[];
};

type IntegrationsSectionProps = {
    integrations?: Array<Integration>;
};

export function IntegrationsSection(props: IntegrationsSectionProps) {
    const { integrations = defaultIntegrations } = props;

    console.log('IntegrationsSection rendered');

    return (
        <section id="integrations" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Where to Use Your AI Agent</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Deploy your book-defined AI agents across a wide range of applications and scenarios.
                    </p>
                </div>

                <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-2 gap-8">
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
