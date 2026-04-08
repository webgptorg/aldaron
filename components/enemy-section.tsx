'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const comparisons = [
    {
        feature: 'Když nezná odpověď',
        chatgpt: 'Sebevědomě si ji vymyslí',
        promptbook: 'Řekne „Nevím"',
    },
    {
        feature: 'Vaše firemní data',
        chatgpt: 'Veřejný cloud. Kdo ví, kdo je čte',
        promptbook: 'Zamčené ve vašem trezoru',
    },
    {
        feature: 'Trénink na vašich datech',
        chatgpt: 'Ano — trénuje na nich další modely',
        promptbook: 'Ne. Nikdy.',
    },
    {
        feature: 'Jak se ptáte',
        chatgpt: '"Act as senior lawyer, temperature 0.2..."',
        promptbook: '"Hele, kde je NDA z 2021?"',
    },
    {
        feature: 'Firemní kontext',
        chatgpt: 'Žádný. Neví nic o vaší firmě',
        promptbook: 'Zná vaše směrnice, smlouvy, procesy',
    },
];

export function EnemySection() {
    return (
        <section className="relative py-24 bg-white overflow-hidden">
            {/* Subtle bg */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-red-50/40 to-transparent rounded-full blur-3xl"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">
                        Proč ne veřejný ChatGPT
                    </p>
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        „Tak to hodím do ChatGPT"{' '}
                        <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                            je firemní sebevražda.
                        </span>
                    </h2>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm"
                >
                    <div className="overflow-x-auto">
                        <div className="min-w-[480px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-gray-50/80">
                                <div className="px-3 sm:px-6 py-4 text-[13px] uppercase tracking-[0.1em] text-gray-400 font-medium"></div>
                                <div className="px-3 sm:px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 sm:px-4 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <span className="text-[12px] sm:text-[13px] font-semibold text-red-600">Veřejný ChatGPT</span>
                                    </div>
                                </div>
                                <div className="px-3 sm:px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 rounded-full px-3 sm:px-4 py-1.5">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                        <span className="text-[12px] sm:text-[13px] font-semibold text-cyan-700">Promptbook</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rows */}
                            {comparisons.map((row, i) => (
                                <div
                                    key={row.feature}
                                    className={`grid grid-cols-[1.2fr_1fr_1fr] ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${i < comparisons.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <div className="px-3 sm:px-6 py-4 sm:py-5 flex items-center">
                                        <span className="text-[13px] sm:text-[15px] font-semibold text-[#0f172a]">{row.feature}</span>
                                    </div>
                                    <div className="px-3 sm:px-6 py-4 sm:py-5 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <X className="w-3 h-3 text-red-500" />
                                        </div>
                                        <span className="text-[12px] sm:text-[14px] text-gray-500">{row.chatgpt}</span>
                                    </div>
                                    <div className="px-3 sm:px-6 py-4 sm:py-5 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-cyan-600" />
                                        </div>
                                        <span className="text-[12px] sm:text-[14px] font-medium text-[#0f172a]">{row.promptbook}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
