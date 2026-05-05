import { cn } from '@/lib/utils';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const PavolHeroBadge3D = dynamic(
    () => import('@/businesses/pavol/PavolHeroBadge3D').then((module) => module.PavolHeroBadge3D),
    {
        ssr: false,
        loading: () => <PavolHeroStaticBadge className="h-[540px]" imageClassName="max-w-[340px]" priority />,
    },
);

type PavolHeroStaticBadgeProps = {
    alt?: string;
    className?: string;
    imageClassName?: string;
    innerClassName?: string;
    priority?: boolean;
};

export function PavolHeroBadge({ alt = 'Pavol Hejný' }: { alt?: string }) {
    return (
        <div className="relative mx-auto w-full max-w-md">
            <div className="lg:hidden">
                <PavolHeroStaticBadge alt={alt} priority />
            </div>
            <div className="hidden lg:block">
                <PavolHeroBadge3D alt={alt} />
            </div>
        </div>
    );
}

export function PavolHeroBadgeShell({
    children,
    className,
    innerClassName,
}: {
    children: React.ReactNode;
    className?: string;
    innerClassName?: string;
}) {
    return (
        <div className={cn('relative mx-auto w-full max-w-md', className)}>
            <div className="absolute inset-0 rounded-[2rem] bg-[var(--pavol-warm)] blur-3xl" />
            <div
                className={cn(
                    'relative h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white via-[#fffdf8] to-[var(--pavol-warm)] shadow-[0_30px_80px_rgba(16,32,51,0.12)]',
                    innerClassName,
                )}
            >
                <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-[var(--pavol-accent)]/10 blur-2xl" />
                <div className="absolute bottom-4 right-4 h-28 w-28 rounded-full bg-[var(--pavol-gold)]/15 blur-2xl" />
                {children}
            </div>
        </div>
    );
}

export function PavolHeroStaticBadge({
    alt = 'Pavol Hejný',
    className,
    imageClassName,
    innerClassName,
    priority = false,
}: PavolHeroStaticBadgeProps) {
    return (
        <PavolHeroBadgeShell className={className} innerClassName={cn('p-6 pb-0', innerClassName)}>
            <div className="relative z-10 flex h-full items-end justify-center">
                <Image
                    src={pavolHejny}
                    alt={alt}
                    priority={priority}
                    className={cn('h-auto w-full max-w-[320px] object-contain', imageClassName)}
                />
            </div>
        </PavolHeroBadgeShell>
    );
}
