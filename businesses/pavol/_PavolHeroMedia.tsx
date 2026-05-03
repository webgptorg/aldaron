'use client';

import { cn } from '@/lib/utils';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type ReactNode, useEffect, useState } from 'react';

const PavolHeroBadgeCanvas = dynamic(
    () => import('@/businesses/pavol/_PavolHeroBadgeCanvas').then((module) => module.PavolHeroBadgeCanvas),
    {
        ssr: false,
        loading: () => <StaticPavolHeroCard className="p-6 pb-0" />,
    },
);

const DESKTOP_BADGE_MEDIA_QUERY = '(min-width: 1024px) and (pointer: fine)';

function useDesktopBadgeEnabled() {
    const [isDesktopBadgeEnabled, setIsDesktopBadgeEnabled] = useState(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(DESKTOP_BADGE_MEDIA_QUERY);
        const updateMatch = () => setIsDesktopBadgeEnabled(mediaQueryList.matches);

        updateMatch();

        if (typeof mediaQueryList.addEventListener === 'function') {
            mediaQueryList.addEventListener('change', updateMatch);

            return () => mediaQueryList.removeEventListener('change', updateMatch);
        }

        mediaQueryList.addListener(updateMatch);

        return () => mediaQueryList.removeListener(updateMatch);
    }, []);

    return isDesktopBadgeEnabled;
}

function HeroCardShell({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <>
            <div className="absolute inset-0 rounded-[2rem] bg-[var(--pavol-warm)] blur-3xl" />
            <div
                className={cn(
                    'relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white via-[#fffdf8] to-[var(--pavol-warm)] shadow-[0_30px_80px_rgba(16,32,51,0.12)]',
                    className,
                )}
            >
                <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[var(--pavol-accent)]/10 blur-2xl" />
                <div className="absolute bottom-4 right-4 h-28 w-28 rounded-full bg-[var(--pavol-gold)]/15 blur-2xl" />
                {children}
            </div>
        </>
    );
}

function StaticPavolHeroCard({ className }: { className?: string }) {
    return (
        <HeroCardShell className={cn('p-6 pb-0', className)}>
            <Image
                src={pavolHejny}
                alt="Pavol Hejný"
                priority
                className="relative z-10 mx-auto h-auto w-full max-w-[320px] object-contain"
            />
        </HeroCardShell>
    );
}

export function PavolHeroMedia() {
    const isDesktopBadgeEnabled = useDesktopBadgeEnabled();

    if (!isDesktopBadgeEnabled) {
        return <StaticPavolHeroCard />;
    }

    return (
        <HeroCardShell className="p-3">
            <PavolHeroBadgeCanvas />
        </HeroCardShell>
    );
}
