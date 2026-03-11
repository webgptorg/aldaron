'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface SignalListSectionProps {
    id?: string;
    title: ReactNode;
    description?: ReactNode;
    signals: string[];
    footer?: ReactNode;
}

export function SignalListSection({ id, title, description, signals, footer }: SignalListSectionProps) {
    return (
        <section
            id={id}
            className="py-20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_58%,#083344_100%)] text-white"
        >
            <div className="container mx-auto px-4">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Signály v týmu</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    {description && <div className="mt-4 text-lg text-slate-300">{description}</div>}
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {signals.map((signal, index) => (
                        <motion.div
                            key={signal}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            viewport={{ once: true, amount: 0.2 }}
                            className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <p className="text-base leading-relaxed text-slate-100">"{signal}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {footer && (
                    <div className="mt-10 max-w-4xl rounded-3xl border border-cyan-400/20 bg-cyan-400/8 px-6 py-5 text-slate-100">
                        {footer}
                    </div>
                )}
            </div>
        </section>
    );
}
