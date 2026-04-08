'use client';

import { motion } from 'framer-motion';
import { FolderSearch, Users, ShieldAlert, UserMinus } from 'lucide-react';

const painPoints = [
    {
        icon: FolderSearch,
        title: 'Roztříštěná firemní data',
        description:
            'Směrnice na SharePointu, smlouvy v e-mailech, manuály na Google Disku, procesy v hlavách lidí. Informace existují — ale jsou rozházené po desítkách systémů.',
        consequence: 'Zaměstnanci tráví výraznou část dne hledáním místo práce, za kterou je platíte.',
        accentColor: 'from-orange-500 to-amber-500',
        bgAccent: 'from-orange-50 to-amber-50',
        borderAccent: 'border-orange-200/50',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
    {
        icon: Users,
        title: 'Klíčoví lidé jako interní helpdesk',
        description:
            'Seniorní zaměstnanci zodpovídají stále stejné dotazy od nováčků a kolegů. Místo strategické práce řeší rutinní informační servis.',
        consequence: 'Vaši nejdražší lidé dělají práci, kterou by měl dělat systém.',
        accentColor: 'from-blue-500 to-indigo-500',
        bgAccent: 'from-blue-50 to-indigo-50',
        borderAccent: 'border-blue-200/50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        icon: ShieldAlert,
        title: 'Riziko veřejné AI',
        description:
            'Zaměstnanci řeší pracovní úkoly přes veřejný ChatGPT — včetně citlivých firemních dokumentů. Veřejná AI nemá kontext vaší firmy a při neznalosti si odpověď domyslí.',
        consequence: 'Jedno rozhodnutí na základě vymyšlené informace může stát víc než roční rozpočet na nástroje.',
        accentColor: 'from-red-500 to-rose-500',
        bgAccent: 'from-red-50 to-rose-50',
        borderAccent: 'border-red-200/50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
    },
    {
        icon: UserMinus,
        title: 'Odcházející know-how',
        description:
            'Když z firmy odejde zkušený člověk, odchází s ním znalosti, které nikde nejsou zdokumentované — rozhodovací procesy, kontext klientských vztahů, historické know-how.',
        consequence: 'Firma přichází o roky budovanou expertízu, kterou nelze jednoduše nahradit.',
        accentColor: 'from-purple-500 to-violet-500',
        bgAccent: 'from-purple-50 to-violet-50',
        borderAccent: 'border-purple-200/50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
];

export function PainPointsSection() {
    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-50/80 to-white overflow-hidden">
            {/* Subtle background orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-100/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl"></div>

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
                        Proč firmy ztrácejí miliony
                    </p>
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-2xl mx-auto"
                        style={{ lineHeight: 1.2 }}
                    >
                        Znalosti ve firmě existují.{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            Problém je, že je nikdo nenajde.
                        </span>
                    </h2>
                </motion.div>

                {/* Pain Point Cards — 2x2 Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                    {painPoints.map((point, i) => (
                        <motion.div
                            key={point.title}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`group relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500`}
                        >
                            {/* Top accent line */}
                            <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${point.accentColor} opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>

                            <div className="flex gap-5">
                                {/* Icon */}
                                <div className={`shrink-0 w-12 h-12 rounded-xl ${point.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <point.icon className={`w-5.5 h-5.5 ${point.iconColor}`} />
                                </div>

                                {/* Content */}
                                <div className="space-y-3 min-w-0">
                                    <h3 className="text-lg font-bold text-[#0f172a] tracking-tight">
                                        {point.title}
                                    </h3>
                                    <p className="text-[15px] text-gray-500 leading-relaxed">
                                        {point.description}
                                    </p>
                                    {/* Consequence tag */}
                                    <div className={`inline-flex items-start gap-2 bg-gradient-to-r ${point.bgAccent} rounded-lg px-3.5 py-2.5 border ${point.borderAccent}`}>
                                        <span className="text-[13px] font-semibold text-gray-600 leading-snug">
                                            → {point.consequence}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
