'use client';

import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { AiSupervizeTerminal } from '@/businesses/ai-supervize/AiSupervizeTerminal';
import { AiSupervizeMiniRegistrationForm } from '@/businesses/ai-supervize-mini/AiSupervizeMiniRegistrationForm';
import {
    aiSupervizeMiniFaqs,
    aiSupervizeMiniHeroBullets,
    aiSupervizeMiniTakeaways,
    aiSupervizeMiniTerminalMetrics,
} from '@/businesses/ai-supervize-mini/aiSupervizeMiniContent';
import { aiSupervizeMiniWorkshopConfig } from '@/businesses/config';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function AiSupervizeMiniPage() {
    const dateSummary = aiSupervizeMiniWorkshopConfig.dates.map((date) => date.label.replace(' 2026', '')).join(' / ');
    const seatSummary = aiSupervizeMiniWorkshopConfig.dates
        .map((date) => `${date.remainingSeats} míst ${date.label.replace(' 2026', '')}`)
        .join(' · ');

    return (
        <main className="min-h-screen bg-white">
            <Header
                getStartedText="Přihlásit se"
                primaryAction={{ label: 'Přihlásit se', href: '#registrace', mobileLabel: 'Přihlásit' }}
                secondaryAction={{ label: 'Pro firmy', href: '/ai-supervize' }}
                centerContent={
                    <>
                        <span>🔥</span>
                        <span>
                            Zbývá <strong className="text-gray-900">{seatSummary}</strong>
                        </span>
                    </>
                }
            />

            <section
                className="relative flex min-h-screen items-center overflow-hidden pt-16"
                style={{
                    backgroundImage: `url(/backgrounds/ai-supervize.svg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 100%',
                }}
            >
                <div className="container relative z-10 mx-auto px-4 py-20 text-white">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, x: -48 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75 }}
                            className="min-w-0 space-y-8"
                        >
                            <div className="space-y-5">
                                <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                    <CalendarDays className="h-4 w-4" />
                                    AI Supervize Mini · {dateSummary} · Praha
                                </div>

                                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                    Jednodenní workshop, jak{' '}
                                    <span className="bg-gradient-promptbook bg-clip-text text-transparent">
                                        řídit AI vývoj
                                    </span>{' '}
                                    od zadání po merge
                                </h1>

                                <p className="max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                                    Hands-on den pro vývojáře a produkťáky, kteří chtějí komplexně přemýšlet nad AI v
                                    TypeScript / JavaScript produktu: nástroje, rizika, verzování, testování a kvalita
                                    kódu.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full bg-promptbook-blue-dark px-8 py-6 text-center text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <Link href="#registrace">
                                        Vybrat termín
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                                >
                                    <Link href="/ai-supervize">Pro firmy</Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/75 sm:gap-5">
                                {aiSupervizeMiniHeroBullets.map((bullet) => (
                                    <div key={bullet} className="flex items-center gap-2 px-3">
                                        <CheckCircle className="h-4 w-4 text-cyan-300" />
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 48 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, delay: 0.2 }}
                            className="min-w-0"
                        >
                            <AiSupervizeTerminal
                                titleBarText="ai-supervize-mini - workshop - 09:00×17:00"
                                commandName="promptbook-mini"
                                commandAction="plan"
                                commandArgs="--workshop one-day --stack ts-js"
                                initializingText="Preparing AI development workshop agenda..."
                                okLines={['Loading tool matrix', 'Checking risk checkpoints', 'Preparing PRD workflow']}
                                reportTitle="WORKSHOP PLAN"
                                reportSubtitle="AI development workflow before / after"
                                doneText="Agenda ready. Pick a date and bring your product context."
                                metrics={aiSupervizeMiniTerminalMetrics}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="registrace" className="bg-slate-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 max-w-3xl">
                        <p className="text-sm font-semibold uppercase text-cyan-700">Registrace na workshop</p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                            Jeden den, malá skupina, konkrétní workflow
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Workshop je pro jednotlivce i firmy, které chtějí poslat své lidi. Cena je{' '}
                            {aiSupervizeMiniWorkshopConfig.pricePerParticipantCzk.toLocaleString('cs-CZ')} Kč za
                            účastníka, kapacita maximálně{' '}
                            {aiSupervizeMiniWorkshopConfig.maxParticipantsPerWorkshop} lidí na termín.
                        </p>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:items-start">
                        <div className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <MapPin className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">Praha</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Přesné místo pošleme po potvrzení registrace. Počítáme s celodenním blokem{' '}
                                        {aiSupervizeMiniWorkshopConfig.timeRange}.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <Users className="h-6 w-6 text-cyan-700" />
                                    <h3 className="mt-3 font-bold text-slate-950">Max 10 lidí</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                        Malá skupina znamená prostor na dotazy, konkrétní situace a zpětnou vazbu k
                                        vašemu workflow.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                                <h3 className="text-xl font-bold text-slate-950">Co během dne projdeme</h3>
                                <div className="mt-5 grid gap-4">
                                    {aiSupervizeMiniTakeaways.map((item) => (
                                        <div key={item.title} className="flex gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                                                <item.icon className="h-5 w-5 text-cyan-700" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-950">{item.title}</h4>
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <AiSupervizeMiniRegistrationForm />
                    </div>
                </div>
            </section>

            <FAQSection
                faqs={aiSupervizeMiniFaqs}
                eyebrow="FAQ"
                title={
                    <>
                        Časté otázky k{' '}
                        <span className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] bg-clip-text text-transparent">
                            AI Supervizi Mini
                        </span>
                    </>
                }
                description="Praktické informace k obsahu, průběhu a registraci."
            />

            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
                        <div className="relative mx-auto max-w-sm">
                            <div className="absolute inset-x-8 bottom-0 h-40 rounded-full bg-cyan-100 blur-2xl" />
                            <Image
                                src={pavolHejny}
                                alt="Pavol Hejný"
                                className="relative z-10 h-auto w-full object-contain"
                                priority={false}
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase text-cyan-700">Workshop vede</p>
                            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Pavol Hejný</h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Pavol je developer s více než 15 lety praxe a aktivní{' '}
                                <Link
                                    href="https://www.pavolhejny.com/"
                                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                                >
                                    open-source contributor
                                </Link>
                                . AI Supervizi staví na každodenní práci s reálným vývojem, code review, toolingem a
                                kvalitou změn, ne na obecné prezentaci o AI.
                            </p>
                            <p className="mt-4 text-base leading-relaxed text-slate-600">
                                Cílem workshopu je ukázat, jak o AI vývoji přemýšlet systémově: jak zadávat práci, jak
                                si hlídat rizika, jak testovat, verzovat a jak poznat, že AI pomáhá produktu místo
                                zvětšování technického dluhu.
                            </p>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                                    <Link href="#registrace">Přihlásit se</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full px-6">
                                    <Link href="mailto:pavol@ptbk.io">pavol@ptbk.io</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer {...czechBusinessFooterProps} />
        </main>
    );
}
