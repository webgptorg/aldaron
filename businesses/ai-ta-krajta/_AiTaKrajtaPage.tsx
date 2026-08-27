import { AiTaKrajtaCollaborationForm } from '@/businesses/ai-ta-krajta/AiTaKrajtaCollaborationForm';
import { AiTaKrajtaEpisodeList } from '@/businesses/ai-ta-krajta/AiTaKrajtaEpisodeList';
import { AiTaKrajtaFooter } from '@/businesses/ai-ta-krajta/AiTaKrajtaFooter';
import { AiTaKrajtaMark } from '@/businesses/ai-ta-krajta/AiTaKrajtaMark';
import { AiTaKrajtaSnake } from '@/businesses/ai-ta-krajta/AiTaKrajtaSnake';
import {
    AI_TA_KRAJTA_COLLABORATION_OPTIONS,
    AI_TA_KRAJTA_COLORS,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_HOST_NAMES,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_PLATFORM_LINKS,
    AI_TA_KRAJTA_RECENT_GUESTS,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
    type AiTaKrajtaCollaborationKind,
    type AiTaKrajtaPlatformId,
} from '@/businesses/ai-ta-krajta/config';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    ArrowUpRight,
    Handshake,
    Headphones,
    Linkedin,
    MessageCircleQuestion,
    MicVocal,
    Podcast,
    Radio,
    Sparkles,
    UsersRound,
    Youtube,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

const AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE = [
    `radial-gradient(circle at 12% 18%, ${AI_TA_KRAJTA_COLORS.CORAL}2d, transparent 36%)`,
    `radial-gradient(circle at 86% 18%, ${AI_TA_KRAJTA_COLORS.VIOLET}2b, transparent 34%)`,
    `linear-gradient(145deg, ${AI_TA_KRAJTA_COLORS.DARKER} 0%, ${AI_TA_KRAJTA_COLORS.DARK} 100%)`,
].join(', ');

const AI_TA_KRAJTA_PAGE_STYLE = {
    ['--ai-ta-krajta-coral' as string]: AI_TA_KRAJTA_COLORS.CORAL,
    ['--ai-ta-krajta-violet' as string]: AI_TA_KRAJTA_COLORS.VIOLET,
} as CSSProperties;

const PLATFORM_ICONS: Readonly<Record<AiTaKrajtaPlatformId, LucideIcon>> = {
    youtube: Youtube,
    spotify: Headphones,
    applePodcasts: Podcast,
};

const COLLABORATION_ICONS: Readonly<Record<AiTaKrajtaCollaborationKind, LucideIcon>> = {
    topic: MessageCircleQuestion,
    guest: MicVocal,
    sponsorship: Handshake,
    other: Sparkles,
};

const NAVIGATION_ITEMS = [
    { label: 'Poslechnout', href: '#epizody' },
    { label: 'Kdo mluví', href: '#lide' },
    { label: 'Spolupráce', href: '#spoluprace' },
    { label: 'Pro firmy', href: '#pro-firmy' },
] as const;

/**
 * Formats an external link consistently without making the route component repeat browser safety attributes.
 */
function ExternalLink({
    href,
    children,
    className,
}: {
    readonly href: string;
    readonly children: ReactNode;
    readonly className?: string;
}) {
    return (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
            {children}
        </a>
    );
}

function GradientText({ children }: { readonly children: ReactNode }) {
    return (
        <span className="bg-gradient-to-r from-[var(--ai-ta-krajta-coral)] to-[var(--ai-ta-krajta-violet)] bg-clip-text text-transparent">
            {children}
        </span>
    );
}

function HeroSection() {
    return (
        <section
            id="o-podcastu"
            className="relative overflow-hidden pt-24 text-white sm:pt-28"
            style={{ backgroundImage: AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE }}
        >
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f7f1] to-transparent" />
            <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
                <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.78fr)]">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                            <Radio className="h-4 w-4 text-[#ff9c90]" />
                            {AI_TA_KRAJTA_KIND}
                        </p>
                        <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                            AI ta <GradientText>Krajta</GradientText>
                        </h1>
                        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-white/82 sm:text-2xl">
                            {AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs}
                        </p>
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/64 sm:text-lg">
                            AI je všude. My si nad ní sedneme, pustíme mikrofony a zkusíme oddělit skutečnou změnu od
                            dobře zabaleného kouře.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full bg-[#ff6b6b] px-7 text-base text-[#171d1a] hover:bg-[#ff8278]"
                            >
                                <ExternalLink href={AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL}>
                                    <Youtube className="mr-2 h-5 w-5" />
                                    Odebírat na YouTube
                                </ExternalLink>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/[0.07] px-7 text-base text-white hover:bg-white/15 hover:text-white"
                            >
                                <Link href="#epizody">
                                    Pustit poslední díl
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute inset-8 overflow-hidden rounded-[3rem] opacity-30 mix-blend-screen">
                            <Image
                                src={AI_TA_KRAJTA_COVER_IMAGE_PATH}
                                alt=""
                                fill
                                sizes="(min-width: 1024px) 32rem, 100vw"
                                className="object-cover"
                                priority
                            />
                        </div>
                        <AiTaKrajtaSnake />
                    </div>
                </div>
            </div>
        </section>
    );
}

function ListeningPlatformsSection() {
    return (
        <section id="poslouchat" className="scroll-mt-28 bg-[#f8f7f1] py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.17em] text-[var(--ai-ta-krajta-coral)]">
                            Kde ji chytit
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Vyberte si <GradientText>svůj způsob poslechu</GradientText>
                        </h2>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                            Na YouTube dejte Odebírat. Ve Spotify nebo Apple Podcasts si Krajtu přidejte do knihovny.
                            Nic složitějšího v tom není.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {AI_TA_KRAJTA_PLATFORM_LINKS.map((platform) => {
                            const Icon = PLATFORM_ICONS[platform.id];

                            return (
                                <ExternalLink
                                    key={platform.id}
                                    href={platform.href}
                                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                                >
                                    <Icon className="h-6 w-6 text-[var(--ai-ta-krajta-violet)]" />
                                    <h3 className="mt-5 text-lg font-bold text-slate-950">{platform.label}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{platform.description}</p>
                                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-950">
                                        Otevřít
                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </span>
                                </ExternalLink>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function EpisodesSection() {
    return (
        <section
            id="epizody"
            className="scroll-mt-28 py-20 sm:py-24"
            style={{ backgroundImage: AI_TA_KRAJTA_DARK_BACKGROUND_IMAGE }}
        >
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.17em] text-[#ff9c90]">Poslední epizody</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Pusťte si jeden díl. <GradientText>Nebo se v tom hezky utopte.</GradientText>
                    </h2>
                    <p className="mt-5 text-lg leading-relaxed text-white/66">
                        Přehrávač se načte až po vašem výběru. Starší díly najdete v celém archivu na YouTube a Spotify.
                    </p>
                </div>

                <AiTaKrajtaEpisodeList />

                <div className="mt-8 flex justify-center">
                    <ExternalLink
                        href={AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
                    >
                        <Youtube className="h-4 w-4" />
                        Otevřít celý video archiv na YouTube
                        <ArrowUpRight className="h-4 w-4" />
                    </ExternalLink>
                </div>
            </div>
        </section>
    );
}

function PeopleSection() {
    return (
        <section id="lide" className="scroll-mt-28 bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.17em] text-[var(--ai-ta-krajta-violet)]">
                            Lidé u mikrofonu
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Není tu jeden hlas, který má vždycky pravdu.
                        </h2>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                            U mikrofonu se střídá parta lidí, která s AI pracuje, přemýšlí o ní a občas se v názorech
                            poctivě rozchází. To je na tom lepší než další výklad z pódia.
                        </p>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-3">
                            {AI_TA_KRAJTA_HOST_NAMES.map((hostName) => (
                                <span
                                    key={hostName}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#f8f7f1] px-4 py-2.5 text-sm font-semibold text-slate-800"
                                >
                                    <MicVocal className="h-4 w-4 text-[var(--ai-ta-krajta-coral)]" />
                                    {hostName}
                                </span>
                            ))}
                        </div>

                        <div className="mt-9 border-t border-slate-200 pt-8">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                                    <UsersRound className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-slate-950">Hosté nejsou kulisa</h3>
                                    <p className="mt-1 text-sm text-slate-600">Přicházejí lidé, kteří mají co říct i po vypnutí prezentace.</p>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                {AI_TA_KRAJTA_RECENT_GUESTS.map((guest) => (
                                    <article key={guest.name} className="rounded-2xl border border-slate-200 p-4">
                                        <h4 className="font-semibold text-slate-950">{guest.name}</h4>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{guest.context}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CompanySection() {
    return (
        <section id="pro-firmy" className="scroll-mt-28 bg-[#f8f7f1] py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.17em] text-[var(--ai-ta-krajta-coral)]">
                        Pro firmy
                    </p>
                    <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] md:items-end">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Partnerství má být poznat. A nemá otravovat posluchače.
                            </h2>
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                Pro značky a týmy, které mají k AI co říct, připravujeme partnerství, hostování i témata
                                do dílu. Hned na začátku si vyjasníme formát, označení spolupráce a co přesně za ni
                                posluchač dostane.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#303832] p-6 text-white">
                            <h3 className="text-lg font-bold">Chcete jednostránkový mediakit?</h3>
                            <p className="mt-3 text-sm leading-relaxed text-white/68">
                                Napište nám termín, záměr a rozpočet. Pošleme vhodné formáty, dostupnost a konkrétní
                                nabídku místo vymyšlené univerzální ceny.
                            </p>
                            <Link
                                href="#spoluprace"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ffaaa2] transition-colors hover:text-white"
                            >
                                Chci řešit partnerství
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CollaborationSection() {
    return (
        <section id="spoluprace" className="scroll-mt-28 bg-white py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.8fr)] lg:items-start">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.17em] text-[var(--ai-ta-krajta-violet)]">
                            Spolupráce
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                            Máte téma, člověka nebo nápad? <GradientText>Hoďte ho na stůl.</GradientText>
                        </h2>
                        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                            Klidně napište i přímo na LinkedIn. Formulář ale neskončí v odložených zprávách a dá nám
                            šanci pochopit, o co jde.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            {AI_TA_KRAJTA_COLLABORATION_OPTIONS.map((option) => {
                                const Icon = COLLABORATION_ICONS[option.id];

                                return (
                                    <article key={option.id} className="rounded-2xl border border-slate-200 p-5">
                                        <Icon className="h-5 w-5 text-[var(--ai-ta-krajta-coral)]" />
                                        <h3 className="mt-4 font-bold text-slate-950">{option.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{option.description}</p>
                                    </article>
                                );
                            })}
                        </div>

                        <ExternalLink
                            href={AI_TA_KRAJTA_LINKEDIN_URL}
                            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
                        >
                            <Linkedin className="h-4 w-4" />
                            Napsat AI ta Krajtě na LinkedInu
                            <ArrowUpRight className="h-4 w-4" />
                        </ExternalLink>
                    </div>

                    <AiTaKrajtaCollaborationForm />
                </div>
            </div>
        </section>
    );
}

/**
 * Dedicated landing page for the podcast. Shared site primitives provide navigation, buttons and legal links, while
 * the structure, copy and snake stay specific to AI ta Krajta.
 */
export function AiTaKrajtaPage() {
    return (
        <main className="min-h-screen bg-white" style={AI_TA_KRAJTA_PAGE_STYLE}>
            <Header
                language="cs"
                brandHref={AI_TA_KRAJTA_PATH}
                brandLogo={
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f7f1] p-1">
                        <AiTaKrajtaMark className="h-full w-full" />
                    </span>
                }
                brandName={<span className="text-lg font-semibold text-slate-950 sm:text-xl">{AI_TA_KRAJTA_NAME}</span>}
                navItems={[...NAVIGATION_ITEMS]}
                primaryAction={{ label: 'YouTube', href: AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL, mobileLabel: 'YouTube' }}
                isPrimaryActionShown
            />

            <HeroSection />
            <ListeningPlatformsSection />
            <EpisodesSection />
            <PeopleSection />
            <CompanySection />
            <CollaborationSection />
            <AiTaKrajtaFooter />
        </main>
    );
}
