'use client';

import { AiTaKrajtaEpisodeCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeCard';
import { AiTaKrajtaSubscriptionForm } from '@/businesses/ai-ta-krajta/AiTaKrajtaSubscriptionForm';
import {
    AI_TA_KRAJTA_EPISODE_PARTS,
    AI_TA_KRAJTA_FAQS,
    AI_TA_KRAJTA_FIT_CARDS,
    AI_TA_KRAJTA_HERO_BADGES,
    AI_TA_KRAJTA_NAV_ITEMS,
    AI_TA_KRAJTA_TOPICS,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaContent';
import {
    AI_TA_KRAJTA_ACCENT_COLOR,
    AI_TA_KRAJTA_ACCENT_SOFT_COLOR,
    AI_TA_KRAJTA_BACKGROUND_COLOR,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_FEATURED_EPISODES,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
} from '@/businesses/ai-ta-krajta/config';
import { czechBusinessFooterProps } from '@/businesses/_generic/czechBusinessFooterProps';
import { FAQSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SectionIntro } from '@/components/section-intro';
import { Button } from '@/components/ui/button';
import pavolHejny from '@/public/people/pavol-hejny-transparent.png';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Play, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Backdrop of the sections which repeat the colors of the cover artwork
 */
const AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE = [
    `radial-gradient(circle at 12% 18%, ${AI_TA_KRAJTA_ACCENT_COLOR}26, transparent 42%)`,
    `radial-gradient(circle at 86% 24%, ${AI_TA_KRAJTA_ACCENT_SOFT_COLOR}26, transparent 38%)`,
    `linear-gradient(180deg, #232a26 0%, ${AI_TA_KRAJTA_BACKGROUND_COLOR} 100%)`,
].join(', ');

/**
 * Gradient the snake of the cover artwork is painted with, borrowed for the words which carry the page
 */
const AI_TA_KRAJTA_TEXT_GRADIENT_IMAGE = `linear-gradient(90deg, ${AI_TA_KRAJTA_ACCENT_COLOR} 0%, ${AI_TA_KRAJTA_ACCENT_SOFT_COLOR} 100%)`;

const AI_TA_KRAJTA_TAGLINE = AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs;

/**
 * What every way to the channel is called, whether it sits in the header or in the middle of the page
 */
const AI_TA_KRAJTA_WATCH_LABEL = 'Sledovat na YouTube';

/**
 * Words painted with the gradient of the cover artwork
 */
function GradientText({ children }: { readonly children: ReactNode }) {
    return (
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: AI_TA_KRAJTA_TEXT_GRADIENT_IMAGE }}>
            {children}
        </span>
    );
}

/**
 * The way to the channel, present wherever the page asks the visitor to start watching
 */
function WatchOnYoutubeButton({ label = AI_TA_KRAJTA_WATCH_LABEL }: { readonly label?: string }) {
    return (
        <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-6 text-center text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: AI_TA_KRAJTA_ACCENT_COLOR }}
        >
            <Link href={AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL}>
                <Youtube className="mr-2 h-5 w-5" />
                {label}
            </Link>
        </Button>
    );
}

/**
 * The cover artwork, which is the only picture the podcast has of itself
 *
 * @param isPriority whether the browser is asked to load it before anything else, which only the copy in the hero is
 *                   worth - the smaller ones are far below the fold
 */
function CoverArtwork({ className, isPriority = false }: { readonly className?: string; readonly isPriority?: boolean }) {
    return (
        <Image
            src={AI_TA_KRAJTA_COVER_IMAGE_PATH}
            alt={`Obal podcastu ${AI_TA_KRAJTA_NAME}`}
            width={480}
            height={480}
            priority={isPriority}
            className={className}
        />
    );
}

function HeroSection() {
    return (
        <section
            className="relative flex min-h-screen items-center overflow-hidden pt-16"
            style={{ backgroundImage: AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE }}
        >
            <div className="container relative z-10 mx-auto px-4 py-20">
                <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.8fr)]">
                    <motion.div
                        initial={{ opacity: 0, x: -48 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.75 }}
                        className="min-w-0 space-y-8"
                    >
                        <div className="space-y-5">
                            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm">
                                <Play className="h-4 w-4" />
                                {AI_TA_KRAJTA_KIND} o umělé inteligenci · nový díl každý týden
                            </div>

                            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                                <GradientText>{AI_TA_KRAJTA_NAME}</GradientText>
                            </h1>

                            <p className="max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                                {AI_TA_KRAJTA_TAGLINE}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                            <WatchOnYoutubeButton />
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/10 px-8 py-6 text-center text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
                            >
                                <Link href="#odber">
                                    <Mail className="mr-2 h-5 w-5" />
                                    Ať mi žádný díl neuteče
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-white/75">
                            {AI_TA_KRAJTA_HERO_BADGES.map((badge) => (
                                <div key={badge} className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.75, delay: 0.2 }}
                        className="relative mx-auto w-full max-w-sm"
                    >
                        <div
                            className="absolute inset-6 rounded-full blur-3xl"
                            style={{ backgroundImage: AI_TA_KRAJTA_TEXT_GRADIENT_IMAGE, opacity: 0.35 }}
                        />
                        <CoverArtwork
                            isPriority
                            className="relative z-10 h-auto w-full rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function EpisodePartsSection() {
    return (
        <section id="o-podcastu" className="scroll-mt-28 bg-white py-20">
            <div className="container mx-auto px-4">
                <SectionIntro
                    eyebrow="O podcastu"
                    title={
                        <>
                            Jeden díl týdně a <GradientText>víš, co se v AI stalo</GradientText>
                        </>
                    }
                    description="Novinek kolem umělé inteligence je tolik, že je nikdo nestíhá číst. Proto je každý týden projdeme za tebe."
                />

                <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2">
                    {AI_TA_KRAJTA_EPISODE_PARTS.map((episodePart) => (
                        <div
                            key={episodePart.title}
                            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                <episodePart.icon
                                    className="h-5 w-5"
                                    style={{ color: AI_TA_KRAJTA_ACCENT_SOFT_COLOR }}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-950">{episodePart.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-slate-600">{episodePart.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TopicsSection() {
    return (
        <section id="temata" className="scroll-mt-28 bg-slate-50 py-20">
            <div className="container mx-auto px-4">
                <SectionIntro
                    eyebrow="Témata"
                    title={
                        <>
                            O čem se v <GradientText>Krajtě</GradientText> bavíme
                        </>
                    }
                    description="Od modelů a nástrojů až po to, co AI dělá s prací, se společností a s pravidly, která pro ni teprve vznikají."
                />

                <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {AI_TA_KRAJTA_TOPICS.map((topic) => (
                        <div
                            key={topic.label}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5"
                        >
                            <topic.icon className="h-5 w-5 shrink-0" style={{ color: AI_TA_KRAJTA_ACCENT_COLOR }} />
                            <span className="text-sm font-semibold text-slate-950">{topic.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-2">
                    {AI_TA_KRAJTA_FIT_CARDS.map((fitCard) => (
                        <div
                            key={fitCard.title}
                            className={
                                fitCard.isPositive
                                    ? 'rounded-2xl border border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm'
                                    : 'rounded-2xl border border-slate-200 bg-slate-100/60 p-6 text-sm text-slate-600'
                            }
                        >
                            <b className="mb-2 block font-bold text-slate-950">{fitCard.title}</b>
                            {fitCard.description}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function WatchSection() {
    const hasFeaturedEpisodes = AI_TA_KRAJTA_FEATURED_EPISODES.length > 0;

    return (
        <section
            id="dily"
            className="scroll-mt-28 py-20"
            style={{ backgroundImage: AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE }}
        >
            <div className="container mx-auto px-4">
                <SectionIntro
                    tone="onDark"
                    eyebrow="Kde sledovat"
                    title={
                        <>
                            Všechny díly jsou <GradientText>zdarma na YouTube</GradientText>
                        </>
                    }
                    description="Je to video podcast, takže se dá stejně dobře pustit na pozadí jen jako zvuk."
                />

                {hasFeaturedEpisodes && (
                    <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {AI_TA_KRAJTA_FEATURED_EPISODES.map((episode) => (
                            <AiTaKrajtaEpisodeCard key={episode.youtubeVideo} episode={episode} />
                        ))}
                    </div>
                )}

                <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-white/12 bg-white/[0.05] p-6 backdrop-blur-sm sm:p-8">
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                        <CoverArtwork className="h-24 w-24 shrink-0 rounded-2xl ring-1 ring-white/15" />

                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-white">{AI_TA_KRAJTA_NAME} na YouTube</h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/65">
                                Na kanálu najdeš celý archiv dílů i ten, který vyšel tento týden.
                            </p>
                        </div>

                        <WatchOnYoutubeButton label="Otevřít kanál" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function HostSection() {
    return (
        <section id="autor" className="scroll-mt-28 overflow-hidden bg-slate-50 py-20">
            <div className="container mx-auto px-4">
                <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.9fr)_1fr]">
                    <div className="relative mx-auto w-full max-w-[26rem] self-end lg:max-w-[32rem]">
                        <div
                            className="absolute inset-x-10 bottom-4 h-40 rounded-full blur-3xl"
                            style={{ backgroundImage: AI_TA_KRAJTA_TEXT_GRADIENT_IMAGE, opacity: 0.18 }}
                        />
                        <Image
                            src={pavolHejny}
                            alt="Pavol Hejný"
                            className="relative z-10 block h-auto w-full object-contain"
                            priority={false}
                        />
                    </div>

                    <div className="pb-4 lg:pb-8">
                        <p
                            className="text-sm font-semibold uppercase tracking-[0.18em]"
                            style={{ color: AI_TA_KRAJTA_ACCENT_SOFT_COLOR }}
                        >
                            Kdo to dělá
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Pavol Hejný</h2>
                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Vývojář s 15+ lety praxe a aktivní open-source contributor. Poslední roky staví s AI reálné
                            produkty a učí to týmy ve firmách, takže o novinkách nemluví z rešerše, ale z praxe.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            Podcast vzniká pod hlavičkou Promptbooku, který staví AI rozumějící firemním datům.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Button asChild className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                                <Link href="/cs/pavol">
                                    Osobní stránka Pavola
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href="/cs">Co je Promptbook</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SubscriptionSection() {
    return (
        <section id="odber" className="scroll-mt-28 bg-white py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] lg:items-center">
                    <div>
                        <p
                            className="text-sm font-semibold uppercase tracking-[0.18em]"
                            style={{ color: AI_TA_KRAJTA_ACCENT_COLOR }}
                        >
                            Odběr
                        </p>
                        <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                            Ať ti žádný díl <GradientText>neuteče</GradientText>
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">
                            Nech nám e-mail a dáme ti vědět, když vyjde nový díl. Žádný spam, žádné každodenní
                            newslettery.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            Nechceš e-maily? Stačí{' '}
                            <Link
                                href={AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL}
                                className="font-semibold underline-offset-4 hover:underline"
                                style={{ color: AI_TA_KRAJTA_ACCENT_SOFT_COLOR }}
                            >
                                odebírat kanál na YouTube
                            </Link>
                            .
                        </p>
                    </div>

                    <AiTaKrajtaSubscriptionForm />
                </div>
            </div>
        </section>
    );
}

export function AiTaKrajtaPage() {
    return (
        <main
            className="min-h-screen bg-white"
            style={
                {
                    ['--section-intro-accent' as string]: AI_TA_KRAJTA_ACCENT_COLOR,
                } as CSSProperties
            }
        >
            <Header
                language="cs"
                brandHref={AI_TA_KRAJTA_PATH}
                brandLogo={<CoverArtwork className="h-8 w-8 rounded-lg" />}
                brandName={<span className="text-xl font-semibold text-slate-900">{AI_TA_KRAJTA_NAME}</span>}
                navItems={[...AI_TA_KRAJTA_NAV_ITEMS]}
                primaryAction={{
                    label: AI_TA_KRAJTA_WATCH_LABEL,
                    href: AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
                    mobileLabel: 'YouTube',
                }}
                secondaryAction={{ label: 'Odběr e-mailem', href: '#odber' }}
            />

            <HeroSection />
            <EpisodePartsSection />
            <TopicsSection />
            <WatchSection />
            <HostSection />
            <SubscriptionSection />

            <div id="faq" className="scroll-mt-28">
                <FAQSection
                    faqs={[...AI_TA_KRAJTA_FAQS]}
                    eyebrow="Časté otázky"
                    title={
                        <>
                            Co se lidé ptají na <GradientText>Krajtu</GradientText>
                        </>
                    }
                    description="Kde podcast vychází, jak často a pro koho je."
                />
            </div>

            <Footer {...czechBusinessFooterProps} />
        </main>
    );
}
