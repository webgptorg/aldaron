'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LucideIcon, Quote } from 'lucide-react';
import Link from 'next/link';

export interface CaseStudySnapshotItem {
    label: string;
    value: string;
}

export interface CaseStudyMetric {
    label: string;
    before: string;
    after: string;
    change: string;
    description: string;
    icon?: LucideIcon;
}

export interface CaseStudyTimelineStep {
    period: string;
    title: string;
    description: string;
}

export interface CaseStudyQuote {
    text: string;
    author: string;
    role: string;
}

export interface CaseStudySectionProps {
    id?: string;
    eyebrow?: string;
    title: string;
    description: string;
    company: string;
    summary: string;
    note?: string;
    snapshot: CaseStudySnapshotItem[];
    metrics: CaseStudyMetric[];
    challengeTitle?: string;
    challengeItems: string[];
    interventionTitle?: string;
    interventionItems: string[];
    timeline: CaseStudyTimelineStep[];
    quote?: CaseStudyQuote;
    ctaText?: string;
    ctaHref?: string;
}

export function CaseStudySection({
    id,
    eyebrow = 'Case study',
    title,
    description,
    company,
    summary,
    note,
    snapshot,
    metrics,
    challengeTitle = 'Výchozí stav',
    challengeItems,
    interventionTitle = 'Co jsme zavedli',
    interventionItems,
    timeline,
    quote,
    ctaText,
    ctaHref,
}: CaseStudySectionProps) {
    return (
        <section id={id} className="bg-slate-950 py-20 text-white">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    <p className="mt-4 text-lg leading-relaxed text-slate-300">{description}</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-sm"
                >
                    <div className="grid gap-8 border-b border-white/10 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
                        <div>
                            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                                {company}
                            </div>
                            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-200">{summary}</p>
                            {note && (
                                <div className="mt-5 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100">
                                    {note}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            {snapshot.map((item, index) => (
                                <div
                                    key={`${item.label}-${index}`}
                                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                                >
                                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
                        {metrics.map((metric, index) => {
                            const Icon = metric.icon;

                            return (
                                <motion.div
                                    key={`${metric.label}-${index}`}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.08 }}
                                    className="bg-slate-900/80 p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                                            {metric.label}
                                        </p>
                                        {Icon && (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5 flex items-end gap-3 text-sm text-slate-400">
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Předtím
                                            </div>
                                            <div className="mt-1 text-lg font-semibold text-slate-200">
                                                {metric.before}
                                            </div>
                                        </div>
                                        <ArrowRight className="mb-1 h-4 w-4 text-cyan-300" />
                                        <div>
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Potom
                                            </div>
                                            <div className="mt-1 text-2xl font-bold text-white">{metric.after}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                                        {metric.change}
                                    </div>

                                    <p className="mt-4 text-sm leading-relaxed text-slate-300">{metric.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <motion.article
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8"
                    >
                        <h3 className="text-2xl font-semibold text-white">{challengeTitle}</h3>
                        <ul className="mt-6 space-y-4">
                            {challengeItems.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <span className="text-sm leading-relaxed text-slate-300">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.article>

                    <motion.article
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 }}
                        className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8"
                    >
                        <h3 className="text-2xl font-semibold text-white">{interventionTitle}</h3>
                        <ul className="mt-6 space-y-4">
                            {interventionItems.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <span className="text-sm leading-relaxed text-slate-100">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.article>

                    <motion.article
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="rounded-3xl border border-white/10 bg-slate-900/80 p-8"
                    >
                        <h3 className="text-2xl font-semibold text-white">30 / 60 / 90 dní</h3>
                        <div className="mt-6 space-y-4">
                            {timeline.map((step, index) => (
                                <div
                                    key={`${step.period}-${index}`}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                >
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                                        {step.period}
                                    </p>
                                    <p className="mt-2 text-base font-semibold text-white">{step.title}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.article>
                </div>

                {(quote || (ctaText && ctaHref)) && (
                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        {quote && (
                            <motion.blockquote
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45 }}
                                className="rounded-3xl border border-white/10 bg-white/5 p-8"
                            >
                                <Quote className="h-8 w-8 text-cyan-300" />
                                <p className="mt-5 text-xl leading-relaxed text-white">“{quote.text}”</p>
                                <footer className="mt-5 text-sm text-slate-400">
                                    <span className="font-semibold text-white">{quote.author}</span>
                                    <span className="mx-2 text-slate-600">•</span>
                                    <span>{quote.role}</span>
                                </footer>
                            </motion.blockquote>
                        )}

                        {ctaText && ctaHref && (
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.05 }}
                                className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-8"
                            >
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                                    Další krok
                                </p>
                                <h3 className="mt-3 text-2xl font-semibold text-white">
                                    Chcete podobný výsledek i ve vašem týmu?
                                </h3>
                                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                                    Začneme discovery workshopem, během kterého zjistíme, kde má AI ve vašem delivery
                                    největší potenciál a jak ji dostat pod kontrolu.
                                </p>
                                <div className="mt-6">
                                    <Link href={ctaHref}>
                                        <Button
                                            size="lg"
                                            className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                                        >
                                            {ctaText}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
