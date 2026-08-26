'use client';

import { COMMUNITY_PATH } from '@/businesses/community/config';
import { CommunityProjectsSection } from '@/businesses/community/projects/CommunityProjectsSection';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CommunityProjectsListingPage() {
    return (
        <main className="min-h-screen bg-[#06131b] px-4 py-6 text-slate-200 sm:px-8 sm:py-8">
            <div className="mx-auto max-w-[1500px]">
                <Link
                    href={COMMUNITY_PATH}
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-cyan-200"
                >
                    <ArrowLeft className="h-4 w-4" /> Zpět do komunity
                </Link>
                <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] px-5 py-5 sm:px-7">
                    <p className="flex items-center gap-2 text-sm font-bold text-cyan-200">
                        <Sparkles className="h-4 w-4" /> Galerie komunity
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Všechny projekty a tvorba členů</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Hlasujte pro projekty, které chcete podpořit, a otevřete jejich diskuzi přímo v komunitě.
                    </p>
                </div>
                <CommunityProjectsSection isLimited={false} />
            </div>
        </main>
    );
}
