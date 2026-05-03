'use client';

import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const DESKTOP_BADGE_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

const PavolHeroDesktopBadge = dynamic(
    () => import('@/businesses/pavol/_PavolHeroDesktopBadge').then((module) => module.PavolHeroDesktopBadge),
    {
        ssr: false,
    },
);

function useMatchesMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const updateMatches = () => {
            setMatches(mediaQueryList.matches);
        };

        updateMatches();
        mediaQueryList.addEventListener('change', updateMatches);

        return () => {
            mediaQueryList.removeEventListener('change', updateMatches);
        };
    }, [query]);

    return matches;
}

function PavolHeroCardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-[var(--pavol-warm)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white via-[#fffdf8] to-[var(--pavol-warm)] p-6 pb-0 shadow-[0_30px_80px_rgba(16,32,51,0.12)]">
                <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[var(--pavol-accent)]/10 blur-2xl" />
                <div className="absolute bottom-4 right-4 h-28 w-28 rounded-full bg-[var(--pavol-gold)]/15 blur-2xl" />
                {children}
            </div>
        </div>
    );
}

function PavolHeroStaticImage() {
    return (
        <Image
            src={pavolHejny}
            alt="Pavol Hejny"
            priority
            className="relative z-10 mx-auto h-auto w-full max-w-[320px] object-contain"
        />
    );
}

export function PavolHeroMedia() {
    const shouldRenderDesktopBadge = useMatchesMediaQuery(DESKTOP_BADGE_QUERY);

    return <PavolHeroCardShell>{shouldRenderDesktopBadge ? <PavolHeroDesktopBadge /> : <PavolHeroStaticImage />}</PavolHeroCardShell>;
}
