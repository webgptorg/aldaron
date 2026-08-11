import {
    AI_TA_KRAJTA_CONTACT_EMAIL,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
} from '@/businesses/ai-ta-krajta/config';
import type { FAQ } from '@/components/faq-section';
import type { LucideIcon } from 'lucide-react';
import { Bot, Building2, Compass, Cpu, Landmark, MessagesSquare, Newspaper, Wrench } from 'lucide-react';
import Link from 'next/link';

/**
 * Short facts about the show, shown right under the headline
 */
export const AI_TA_KRAJTA_HERO_BADGES: readonly string[] = [
    'Nový díl každý týden',
    AI_TA_KRAJTA_KIND,
    'Česky',
    'Zdarma',
];

/**
 * Where in the page the header navigation leads
 */
export const AI_TA_KRAJTA_NAV_ITEMS: readonly { readonly label: string; readonly href: string }[] = [
    { label: 'O podcastu', href: '#o-podcastu' },
    { label: 'Témata', href: '#temata' },
    { label: 'Kde sledovat', href: '#dily' },
    { label: 'Kdo to dělá', href: '#autor' },
    { label: 'Časté otázky', href: '#faq' },
];

type EpisodePart = {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
};

/**
 * What a listener gets out of a single episode
 */
export const AI_TA_KRAJTA_EPISODE_PARTS: readonly EpisodePart[] = [
    {
        icon: Newspaper,
        title: 'Novinky, ve kterých se dá vyznat',
        description:
            'Za týden toho v AI vyjde víc, než se dá přečíst. Projdeme, co skutečně přibylo, a hlavně co z toho stojí za pozornost.',
    },
    {
        icon: Compass,
        title: 'Zajímavosti, na které jinde nenarazíš',
        description:
            'Věci, které se do přehledu novinek nevejdou, ale jsou nejzajímavější. Podivné experimenty, přehlédnuté nástroje, souvislosti.',
    },
    {
        icon: MessagesSquare,
        title: 'Diskuze, ne přednáška',
        description:
            'Nad každým tématem se bavíme nahlas, včetně toho, kde si nejsme jistí. Žádné hotové pravdy naservírované do kamery.',
    },
    {
        icon: Wrench,
        title: 'Co si z toho odnést',
        description:
            'U každé novinky řešíme to podstatné: k čemu je dobrá, komu se vyplatí ji zkusit a kdy je to zatím jen hezké demo.',
    },
];

/**
 * Areas of artificial intelligence the show keeps coming back to
 */
export const AI_TA_KRAJTA_TOPICS: readonly { readonly icon: LucideIcon; readonly label: string }[] = [
    { icon: Cpu, label: 'Nové modely a nástroje' },
    { icon: Bot, label: 'AI agenti a automatizace' },
    { icon: Wrench, label: 'AI ve vývoji softwaru' },
    { icon: Building2, label: 'AI v běžné práci a ve firmách' },
    { icon: Landmark, label: 'Regulace, etika a bezpečnost' },
    { icon: Compass, label: 'Kam se to celé posouvá' },
];

type FitCard = {
    readonly title: string;
    readonly description: string;
    readonly isPositive: boolean;
};

/**
 * Who the show is written for, and who is better off elsewhere
 */
export const AI_TA_KRAJTA_FIT_CARDS: readonly FitCard[] = [
    {
        title: 'Je to pro tebe, pokud',
        description:
            'chceš mít o AI přehled, ale nechceš kvůli tomu denně číst dvacet newsletterů. Stačí ti jeden díl týdně a víš, co se stalo.',
        isPositive: true,
    },
    {
        title: 'Není to pro tebe, pokud',
        description:
            'hledáš akademickou přednášku nebo návod krok za krokem. Tohle je pořad o dění kolem AI, ne kurz jednoho nástroje.',
        isPositive: false,
    },
];

export const AI_TA_KRAJTA_FAQS: readonly FAQ[] = [
    {
        question: 'Kde podcast vychází?',
        answer: (
            <p>
                Na YouTube kanálu{' '}
                <Link
                    href={AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL}
                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                >
                    {AI_TA_KRAJTA_NAME}
                </Link>
                . Je to video podcast, takže díly se dají stejně dobře pustit na pozadí jen jako zvuk.
            </p>
        ),
    },
    {
        question: 'Jak často vychází nový díl?',
        answer: <p>Každý týden.</p>,
    },
    {
        question: 'Stojí to něco?',
        answer: <p>Ne. Všechny díly jsou volně dostupné na YouTube, bez registrace a bez předplatného.</p>,
    },
    {
        question: 'Musím být programátor?',
        answer: (
            <p>
                Ne. Bavíme se tak, aby tomu rozuměl každý, koho AI zajímá. Technická témata vysvětlujeme, místo abychom
                předpokládali, že je posluchač už zná.
            </p>
        ),
    },
    {
        question: 'Můžu navrhnout téma nebo přijít jako host?',
        answer: (
            <p>
                Klidně. Napiš na{' '}
                <Link
                    href={`mailto:${AI_TA_KRAJTA_CONTACT_EMAIL}`}
                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                >
                    {AI_TA_KRAJTA_CONTACT_EMAIL}
                </Link>{' '}
                a domluvíme se.
            </p>
        ),
    },
    {
        question: 'Kdo podcast dělá?',
        answer: (
            <p>
                Vývojář{' '}
                <Link href="/cs/pavol" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
                    Pavol Hejný
                </Link>
                , který s AI staví reálné produkty a učí to týmy ve firmách. Podcast vzniká pod hlavičkou{' '}
                <Link href="/cs" className="font-semibold text-cyan-700 underline-offset-4 hover:underline">
                    Promptbooku
                </Link>
                .
            </p>
        ),
    },
];
