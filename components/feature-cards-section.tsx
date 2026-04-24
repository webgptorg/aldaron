'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface FeatureCard {
    icon?: LucideIcon;
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    items?: ReactNode[];
    highlight?: ReactNode;
}

interface FeatureCardsSectionProps {
    id?: string;
    title: ReactNode;
    description?: ReactNode;
    note?: ReactNode;
    cards: FeatureCard[];
    columns?: 2 | 3 | 4;
    tone?: 'white' | 'muted' | 'contrast';
    className?: string;
    cardClassName?: string;
}

const gridClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 xl:grid-cols-3',
    4: 'md:grid-cols-2 xl:grid-cols-4',
};

const toneClasses = {
    white: {
        section: 'bg-white text-gray-900',
        description: 'text-gray-600',
        note: 'border-cyan-100 bg-cyan-50/80 text-cyan-950',
        card: 'border-gray-200 bg-white text-gray-900 shadow-[0_16px_45px_rgba(15,23,42,0.08)]',
        eyebrow: 'text-cyan-700',
        body: 'text-gray-600',
        bullet: 'bg-cyan-100 text-cyan-700',
        highlight: 'border-amber-200 bg-amber-50 text-amber-900',
    },
    muted: {
        section: 'bg-slate-50 text-gray-900',
        description: 'text-gray-600',
        note: 'border-cyan-100 bg-white text-cyan-950',
        card: 'border-slate-200 bg-white/90 text-gray-900 shadow-[0_16px_45px_rgba(15,23,42,0.08)]',
        eyebrow: 'text-cyan-700',
        body: 'text-gray-600',
        bullet: 'bg-cyan-100 text-cyan-700',
        highlight: 'border-amber-200 bg-amber-50 text-amber-900',
    },
    contrast: {
        section: 'bg-slate-950 text-white',
        description: 'text-slate-300',
        note: 'border-white/10 bg-white/5 text-white',
        card: 'border-white/10 bg-white/5 text-white shadow-[0_16px_45px_rgba(2,6,23,0.28)] backdrop-blur-sm',
        eyebrow: 'text-cyan-300',
        body: 'text-slate-300',
        bullet: 'bg-cyan-400/10 text-cyan-200',
        highlight: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    },
};

export function FeatureCardsSection({
    id,
    title,
    description,
    note,
    cards,
    columns = 3,
    tone = 'muted',
    className,
    cardClassName,
}: FeatureCardsSectionProps) {
    const styles = toneClasses[tone];

    return (
        <section id={id} className={cn('py-20', styles.section, className)}>
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                    {description && <p className={cn('mt-4 text-lg leading-relaxed', styles.description)}>{description}</p>}
                    {note && (
                        <div
                            className={cn(
                                'mt-6 rounded-2xl border px-5 py-4 text-left text-sm leading-relaxed shadow-sm',
                                styles.note,
                            )}
                        >
                            {note}
                        </div>
                    )}
                </div>

                <div className={cn('mt-12 grid gap-6', gridClasses[columns])}>
                    {cards.map((card, index) => {
                        const Icon = card.icon;

                        return (
                            <motion.article
                                key={index}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                whileHover={{ y: -4 }}
                                className={cn(
                                    'group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300',
                                    styles.card,
                                    cardClassName,
                                )}
                            >
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),_transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="relative">
                                    {Icon && (
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 shadow-sm ring-1 ring-cyan-500/15">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                    )}

                                    {card.eyebrow && (
                                        <p className={cn('text-sm font-semibold uppercase tracking-[0.2em]', styles.eyebrow)}>
                                            {card.eyebrow}
                                        </p>
                                    )}

                                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{card.title}</h3>

                                    {card.description && (
                                        <div className={cn('mt-4 text-base leading-relaxed', styles.body)}>
                                            {card.description}
                                        </div>
                                    )}

                                    {card.items && card.items.length > 0 && (
                                        <ul className="mt-6 space-y-3">
                                            {card.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start gap-3">
                                                    <span
                                                        className={cn(
                                                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                                                            styles.bullet,
                                                        )}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                    <span className={cn('text-sm leading-relaxed', styles.body)}>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {card.highlight && (
                                        <div
                                            className={cn(
                                                'mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-medium',
                                                styles.highlight,
                                            )}
                                        >
                                            {card.highlight}
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
