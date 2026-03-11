'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface ContentCard {
    icon: LucideIcon;
    eyebrow?: string;
    title: string;
    description: ReactNode;
    bullets?: string[];
    footer?: ReactNode;
}

interface ContentCardsSectionProps {
    id?: string;
    badge?: string;
    title: ReactNode;
    description?: ReactNode;
    items: ContentCard[];
    columns?: 2 | 3;
    theme?: 'light' | 'dark';
}

export function ContentCardsSection({
    id,
    badge,
    title,
    description,
    items,
    columns = 3,
    theme = 'light',
}: ContentCardsSectionProps) {
    const isDark = theme === 'dark';

    return (
        <section
            id={id}
            className={cn(
                'py-20',
                isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-white via-slate-50 to-cyan-50/40',
            )}
        >
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    {badge && (
                        <p
                            className={cn(
                                'text-sm font-semibold uppercase tracking-[0.3em]',
                                isDark ? 'text-cyan-300' : 'text-cyan-700',
                            )}
                        >
                            {badge}
                        </p>
                    )}
                    <h2 className={cn('mt-3 text-3xl font-bold tracking-tight sm:text-4xl', isDark && 'text-white')}>
                        {title}
                    </h2>
                    {description && (
                        <div className={cn('mt-4 text-lg', isDark ? 'text-slate-300' : 'text-slate-600')}>
                            {description}
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        'mt-12 grid gap-6',
                        columns === 2 ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3',
                    )}
                >
                    {items.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.article
                                key={`${item.title}-${index}`}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: index * 0.08 }}
                                viewport={{ once: true, amount: 0.2 }}
                                className={cn(
                                    'group relative overflow-hidden rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                                    isDark
                                        ? 'border-white/10 bg-white/5 shadow-cyan-950/20'
                                        : 'border-slate-200 bg-white/90',
                                )}
                            >
                                <div
                                    className={cn(
                                        'absolute inset-x-0 top-0 h-1',
                                        isDark
                                            ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300'
                                            : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400',
                                    )}
                                />
                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className={cn(
                                            'flex h-14 w-14 items-center justify-center rounded-2xl',
                                            isDark ? 'bg-cyan-400/10 text-cyan-300' : 'bg-cyan-50 text-cyan-700',
                                        )}
                                    >
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    {item.eyebrow && (
                                        <span
                                            className={cn(
                                                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                                                isDark
                                                    ? 'bg-white/8 text-slate-200'
                                                    : 'bg-slate-100 text-slate-600',
                                            )}
                                        >
                                            {item.eyebrow}
                                        </span>
                                    )}
                                </div>

                                <h3 className={cn('mt-6 text-2xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                                    {item.title}
                                </h3>
                                <div className={cn('mt-4 leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
                                    {item.description}
                                </div>

                                {item.bullets && item.bullets.length > 0 && (
                                    <ul className="mt-6 space-y-3">
                                        {item.bullets.map((bullet) => (
                                            <li
                                                key={bullet}
                                                className={cn(
                                                    'flex items-start gap-3 text-sm',
                                                    isDark ? 'text-slate-200' : 'text-slate-700',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'mt-1.5 h-2 w-2 rounded-full',
                                                        isDark ? 'bg-cyan-300' : 'bg-cyan-600',
                                                    )}
                                                />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {item.footer && (
                                    <div
                                        className={cn(
                                            'mt-6 rounded-2xl border px-4 py-4 text-sm',
                                            isDark
                                                ? 'border-white/10 bg-white/6 text-slate-100'
                                                : 'border-cyan-100 bg-cyan-50/80 text-slate-700',
                                        )}
                                    >
                                        {item.footer}
                                    </div>
                                )}
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
