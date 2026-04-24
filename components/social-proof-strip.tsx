'use client';

import { motion } from 'framer-motion';
import { Building2, GraduationCap, HardHat, Landmark, Scale, Stethoscope } from 'lucide-react';

const industries = [
    { icon: Building2, label: 'Výrobní firmy' },
    { icon: Scale, label: 'Advokátní kanceláře' },
    { icon: HardHat, label: 'Stavební firmy' },
    { icon: Landmark, label: 'Veřejná správa' },
    { icon: Stethoscope, label: 'Zdravotnictví' },
    { icon: GraduationCap, label: 'Vzdělávání' },
];

export function SocialProofStrip() {
    return (
        <section className="relative py-16 bg-white border-y border-gray-100">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-10">
                        Navrženo pro firmy, které berou svá data vážně
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
                        {industries.map((industry, i) => (
                            <motion.div
                                key={industry.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex items-center gap-2.5 group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-cyan-50 group-hover:to-blue-50 group-hover:border-cyan-200/50 transition-all duration-300">
                                    <industry.icon className="w-4 h-4 text-gray-400 group-hover:text-[#0891b2] transition-colors duration-300" />
                                </div>
                                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors duration-300">
                                    {industry.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
