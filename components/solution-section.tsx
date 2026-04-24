'use client';

import { motion } from 'framer-motion';
import { Lock, MessageCircle, ShieldCheck } from 'lucide-react';

const benefits = [
    {
        icon: MessageCircle,
        title: 'Zero-Prompt',
        description:
            'Žádné školení. Žádné „napiš prompt jako ajťák". Vaši zaměstnanci jsou experti na svůj obor, ne na zaříkávání robotů. Prostě se zeptají — písemně nebo hlasovkou — a dostanou odpověď.',
        highlight: 'Tak, jak jsou zvyklí komunikovat s lidmi.',
        gradient: 'from-cyan-500 to-blue-500',
        iconBg: 'bg-gradient-to-br from-cyan-100 to-blue-100',
        iconColor: 'text-cyan-600',
    },
    {
        icon: Lock,
        title: 'Kontextový trezor',
        description:
            'Data nikdy neopustí vaši infrastrukturu. Nepoužíváme je na trénování žádných modelů. Víte, co se stane, když zaměstnanec zkopíruje NDA do veřejného ChatGPT?',
        highlight: 'My taky. Proto jsme to udělali jinak.',
        gradient: 'from-emerald-500 to-teal-500',
        iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
        iconColor: 'text-emerald-600',
    },
    {
        icon: ShieldCheck,
        title: '„Nevím" je lepší než halucinace',
        description:
            'Veřejná AI si vymyslí pět odstavců, které zní důvěryhodně — a mohou vás stát firmu. Promptbook čerpá výhradně z vašich dat. A když odpověď nenajde?',
        highlight: 'Narovinu řekne: „Tuto informaci ve vašich dokumentech nemám."',
        gradient: 'from-violet-500 to-purple-500',
        iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100',
        iconColor: 'text-violet-600',
    },
];

export function SolutionSection() {
    return (
        <section className="relative py-24 bg-white overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-50/40 via-transparent to-transparent"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-[13px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-4">Řešení</p>
                    <h2
                        className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-[#0f172a] tracking-tight max-w-3xl mx-auto mb-5"
                        style={{ lineHeight: 1.2 }}
                    >
                        Virtuální zaměstnanec, který{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            zná celou firmu.
                        </span>
                    </h2>
                    <p className="text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Nahrajte firemní dokumenty do bezpečného trezoru. Promptbook z nich vytvoří virtuálního
                        zaměstnance — HR-istu, právníka, technika — kterého se kdokoliv zeptá normální češtinou.
                    </p>
                </motion.div>

                {/* 3 Benefit Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-100/80 hover:border-gray-200/80 transition-all duration-500 flex flex-col"
                        >
                            {/* Top gradient line */}
                            <div
                                className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${benefit.gradient} rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                            ></div>

                            {/* Icon */}
                            <div
                                className={`w-14 h-14 rounded-2xl ${benefit.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                            >
                                <benefit.icon className={`w-6 h-6 ${benefit.iconColor}`} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-[#0f172a] tracking-tight mb-3">{benefit.title}</h3>
                            <p className="text-[15px] text-gray-500 leading-relaxed mb-4 flex-1">
                                {benefit.description}
                            </p>
                            <p className="text-[15px] font-semibold text-[#0f172a] leading-relaxed">
                                {benefit.highlight}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
