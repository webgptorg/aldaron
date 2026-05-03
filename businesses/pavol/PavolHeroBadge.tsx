'use client';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image, { type StaticImageData } from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const PavolHeroBadgeCanvas = dynamic(() => import('./PavolHeroBadgeCanvas'), {
    ssr: false,
});

type PavolHeroBadgeProps = {
    image: StaticImageData;
    alt: string;
};

function useDesktopBadgeEnabled() {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const widthQuery = window.matchMedia('(min-width: 1024px)');
        const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
        const update = () => setIsEnabled(widthQuery.matches && !coarsePointerQuery.matches);

        update();
        widthQuery.addEventListener('change', update);
        coarsePointerQuery.addEventListener('change', update);

        return () => {
            widthQuery.removeEventListener('change', update);
            coarsePointerQuery.removeEventListener('change', update);
        };
    }, []);

    return isEnabled;
}

function PavolHeroStaticPortrait({ image, alt }: PavolHeroBadgeProps) {
    return (
        <>
            <div className="absolute inset-0 rounded-[2rem] bg-[var(--pavol-warm)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white via-[#fffdf8] to-[var(--pavol-warm)] p-6 pb-0 shadow-[0_30px_80px_rgba(16,32,51,0.12)]">
                <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[var(--pavol-accent)]/10 blur-2xl" />
                <div className="absolute bottom-4 right-4 h-28 w-28 rounded-full bg-[var(--pavol-gold)]/15 blur-2xl" />
                <Image
                    src={image}
                    alt={alt}
                    priority
                    className="relative z-10 mx-auto h-auto w-full max-w-[320px] object-contain"
                />
            </div>
        </>
    );
}

export function PavolHeroBadge({ image, alt }: PavolHeroBadgeProps) {
    const isDesktopBadgeEnabled = useDesktopBadgeEnabled();
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    useEffect(() => {
        if (!isDesktopBadgeEnabled) {
            setIsCanvasReady(false);
        }
    }, [isDesktopBadgeEnabled]);

    const handleCanvasReady = useCallback(() => {
        setIsCanvasReady(true);
    }, []);

    return (
        <div className="relative mx-auto w-full max-w-md">
            <div
                aria-hidden={isDesktopBadgeEnabled && isCanvasReady}
                className={cn(
                    'relative transition-opacity duration-500',
                    isDesktopBadgeEnabled && isCanvasReady && 'lg:opacity-0',
                )}
            >
                <PavolHeroStaticPortrait image={image} alt={alt} />
            </div>

            {isDesktopBadgeEnabled ? (
                <div
                    aria-label={alt}
                    className={cn(
                        'absolute -inset-x-10 -inset-y-12 z-20 hidden transition-opacity duration-500 lg:block',
                        isCanvasReady ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                    )}
                    role="img"
                >
                    <PavolHeroBadgeCanvas imageSrc={image.src} onReady={handleCanvasReady} />
                </div>
            ) : null}
        </div>
    );
}
