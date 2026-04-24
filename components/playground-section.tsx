'use client';

import dynamic from 'next/dynamic';

const AboutPromptbookInformation = dynamic(
    () => import('@promptbook/components').then((module) => module.AboutPromptbookInformation),
    { ssr: false },
);

export function PlaygroundSection() {
    return (
        <section className="container mx-auto py-12 md:py-24">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Playground</h2>
                <p className="mt-4 text-lg text-muted-foreground">Just testing</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <AboutPromptbookInformation />
            </div>
        </section>
    );
}
