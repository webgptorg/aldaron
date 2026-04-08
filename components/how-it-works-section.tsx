'use client';

import { motion } from 'framer-motion';
import { Upload, Bot, MessageSquareText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
    {
        number: '01',
        icon: Upload,
        title: 'Nahrajete dokumenty',
        description:
            'Směrnice, smlouvy, manuály, NDAčka, zápisy z porad — cokoliv, co dnes leží rozházené po SharePointu, Google Disku nebo v šuplíku. Promptbook pojme až milion normostran.',
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        number: '02',
        icon: Bot,
        title: 'Vytvoříte virtuálního zaměstnance',
        description:
            'HR-istu, který zná pracovní řád. Právníka, který zná všechny smlouvy. Technika, který zná manuály. Každý agent odpovídá přesně podle vašich firemních dat.',
        gradient: 'from-blue-500 to-indigo-500',
    },
    {
        number: '03',
        icon: MessageSquareText,
        title: 'Lidé se ptají',
        description:
            'Normální češtinou. Jako by psali zprávu na WhatsApp. Nebo pošlou hlasovku. Bez promptů, bez školení, bez ajťáků.',
        gradient: 'from-indigo-500 to-violet-500',
    },
];

export function HowItWorksSection() {
    const handleCTAClick = () => {
        window.dispatchEvent(new CustomEvent('open-qualification-popup'));
    };

    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        Jak to funguje
                    </p>
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-2xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        Nasazení,{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            které nebolí.
                        </span>
                    </h2>
                </motion.div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden md:block absolute top-[4.5rem] left-[16.66%] right-[16.66%] h-px">
                        <div className="w-full h-full bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 opacity-40"></div>
                    </div>

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="relative text-center"
                        >
                            {/* Step number circle */}
                            <div className="relative mx-auto mb-8">
                                <div className={`w-[90px] h-[90px] rounded-full bg-gradient-to-br ${step.gradient} p-[2px] mx-auto`}>
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                        <step.icon className="w-8 h-8 text-gray-700" />
                                    </div>
                                </div>
                                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                                    <span className="text-[11px] font-bold text-white">{step.number}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-[#0f172a] tracking-tight mb-3">
                                {step.title}
                            </h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-16"
                >
                    <Button
                        onClick={handleCTAClick}
                        size="lg"
                        className="bg-gradient-to-r from-[#0e7490] to-[#0891b2] text-white hover:shadow-xl hover:shadow-cyan-500/15 transform hover:scale-[1.03] transition-all duration-300 text-[16px] font-semibold px-8 py-6 rounded-full border border-white/20"
                    >
                        Chci vidět, jak to funguje
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
