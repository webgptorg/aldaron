import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Background the intro is written on, which decides how light or dark every line of it has to be
 */
export type SectionIntroTone = 'onLight' | 'onDark';

type SectionIntroProps = {
    /**
     * Small uppercase line above the headline
     */
    readonly eyebrow: ReactNode;

    /**
     * Headline of the section
     */
    readonly title: ReactNode;

    /**
     * Supporting sentence below the headline
     */
    readonly description?: ReactNode;

    /**
     * Background the intro is written on, defaults to a light one
     */
    readonly tone?: SectionIntroTone;

    /**
     * Additional classes of the wrapper, for example a different maximal width
     */
    readonly className?: string;
};

/**
 * Colors of every line of the intro, for each background it can be written on
 *
 * Note: The accent of the eyebrow on a dark background is taken from a custom property, so a page with its own brand
 *       color only sets that one property instead of restyling the whole intro.
 */
const SECTION_INTRO_TONE_CLASS_NAMES: Readonly<
    Record<SectionIntroTone, { readonly eyebrow: string; readonly title: string; readonly description: string }>
> = {
    onLight: {
        eyebrow: 'text-cyan-700',
        title: 'text-slate-950',
        description: 'text-slate-600',
    },
    onDark: {
        eyebrow: 'text-[color:var(--section-intro-accent,#67e8f9)]',
        title: 'text-white',
        description: 'text-white/70',
    },
};

/**
 * Eyebrow, headline and supporting sentence which introduce a section, centered above its content
 */
export function SectionIntro({ eyebrow, title, description, tone = 'onLight', className }: SectionIntroProps) {
    const toneClassNames = SECTION_INTRO_TONE_CLASS_NAMES[tone];

    return (
        <div className={cn('mx-auto max-w-3xl text-center', className)}>
            <p className={cn('text-sm font-semibold uppercase tracking-[0.18em]', toneClassNames.eyebrow)}>{eyebrow}</p>
            <h2 className={cn('mt-3 text-3xl font-bold sm:text-4xl', toneClassNames.title)}>{title}</h2>
            {description && (
                <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', toneClassNames.description)}>
                    {description}
                </p>
            )}
        </div>
    );
}
