'use client';

import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { AiTaKrajtaSnakeTerrarium } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnakeTerrarium';
import {
    formatAiTaKrajtaMonthAfterOd,
    formatCzechCountedNoun,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaFormatting';
import { AI_TA_KRAJTA_PLATFORMS, AI_TA_KRAJTA_SECTION_IDS } from '@/businesses/ai-ta-krajta/config';
import { ArrowUpRight, Play } from 'lucide-react';

/**
 * One fact about the show, drawn from the feed rather than written by hand
 */
function AiTaKrajtaFact({ label, value }: { readonly label: string; readonly value: string }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-white/40">{label}</dt>
            <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
        </div>
    );
}

/**
 * The opening of the page, which says what the show is, where it comes out and lets the logo be played with
 */
export function AiTaKrajtaHero() {
    const { archive, playEpisode } = useAiTaKrajtaPageState();
    const newestEpisode = archive.episodes[0] ?? null;

    return (
        <section className="relative overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-40 -top-52 h-[34rem] w-[34rem] rounded-full bg-[#ff6b6b]/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 top-24 h-[30rem] w-[30rem] rounded-full bg-[#6b8cff]/10 blur-3xl"
            />

            <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16">
                <div>
                    <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                        AI ta Krajta
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
                        Každý týden si sedneme a probereme, co se v AI za těch sedm dní stalo. Nové modely, nástroje,
                        průšvihy. Občas se pohádáme o tom, jestli to celé dává smysl.
                    </p>

                    <p className="mt-4 max-w-xl leading-relaxed text-white/55">
                        Video vychází na YouTube, zvuk na Spotify a v Apple Podcasts. Česky. U mikrofonu se střídá parta
                        lidí, kteří AI staví nebo nasazují, a hosté, kteří k tomu mají co říct.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => newestEpisode !== null && playEpisode(newestEpisode)}
                            disabled={newestEpisode === null}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff6b6b] px-6 text-base font-semibold text-[#1a201c] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Play className="h-5 w-5 fill-current" />
                            {newestEpisode === null ? 'Poslední díl' : `Pustit díl ${newestEpisode.slug}`}
                        </button>

                        <a
                            href={`#${AI_TA_KRAJTA_SECTION_IDS.EPISODES}`}
                            className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white transition-colors hover:border-white/50"
                        >
                            Projít archiv
                        </a>
                    </div>

                    <div className="mt-10">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/40">Odebírat</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {AI_TA_KRAJTA_PLATFORMS.map((platform) => (
                                <li key={platform.id}>
                                    <a
                                        href={platform.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={platform.description}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/35 hover:text-white"
                                    >
                                        {platform.label}
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {archive.episodes.length > 0 && (
                        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
                            <AiTaKrajtaFact
                                label="Zatím venku"
                                value={formatCzechCountedNoun(archive.episodes.length, ['díl', 'díly', 'dílů'])}
                            />
                            {archive.firstPublishedAt !== null && (
                                <AiTaKrajtaFact
                                    label="Běží od"
                                    value={formatAiTaKrajtaMonthAfterOd(archive.firstPublishedAt)}
                                />
                            )}
                            {archive.medianDurationInMinutes !== null && (
                                <AiTaKrajtaFact
                                    label="Obvyklá délka"
                                    value={formatCzechCountedNoun(archive.medianDurationInMinutes, [
                                        'minuta',
                                        'minuty',
                                        'minut',
                                    ])}
                                />
                            )}
                        </dl>
                    )}
                </div>

                <AiTaKrajtaSnakeTerrarium />
            </div>
        </section>
    );
}
