import {
    AI_TA_KRAJTA_BACKGROUND_COLOR,
    AI_TA_KRAJTA_COVER_IMAGE_PATH,
    AI_TA_KRAJTA_KIND,
    AI_TA_KRAJTA_NAME,
    AI_TA_KRAJTA_PATH,
    AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE,
} from '@/businesses/ai-ta-krajta/config';
import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type PavolMediaImportance = 'highlight' | 'rest';

export type PavolMediaAppearance = {
    href: string;
    imageSrc?: string;
    source: string;
    kind: string;
    title: string;
    description: string;
    importance: PavolMediaImportance;
    thumbnailLabel?: string;
    thumbnailClassName?: string;

    /**
     * Color behind the thumbnail, for an appearance whose brand color is written down elsewhere
     *
     * Note: Tailwind only knows the classes which are spelled out in the source, so a color which comes from a
     *       configuration has to reach the thumbnail as a style rather than as a class.
     */
    thumbnailBackgroundColor?: string;
};

type LocalizedMediaCopy = Pick<PavolMediaAppearance, 'kind' | 'title' | 'description'>;

type SharedMediaAppearance = Omit<PavolMediaAppearance, 'kind' | 'title' | 'description'> & {
    copy: Record<SupportedHomepageLanguage, LocalizedMediaCopy>;
};

export const pavolMediaMoreHref = 'https://www.linkedin.com/in/hejny/';

const sharedMediaAppearances: SharedMediaAppearance[] = [
    {
        // Note: The podcast has a page of its own, which is where a visitor learns the most about it and finds the way
        //       to the YouTube channel. Everything the card says about it is taken from the very same configuration
        //       that page is built from.
        href: AI_TA_KRAJTA_PATH,
        imageSrc: AI_TA_KRAJTA_COVER_IMAGE_PATH,
        source: 'YouTube',
        importance: 'highlight',
        thumbnailBackgroundColor: AI_TA_KRAJTA_BACKGROUND_COLOR,
        copy: {
            cs: {
                kind: AI_TA_KRAJTA_KIND,
                title: AI_TA_KRAJTA_NAME,
                description: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.cs,
            },
            en: {
                kind: AI_TA_KRAJTA_KIND,
                title: AI_TA_KRAJTA_NAME,
                description: AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE.en,
            },
        },
    },
    {
        href: 'https://ceskepodcasty.cz/podcast/zatisi/zatisi-3-1-2024-pavol-hejny-tomas-studenik',
        imageSrc: '/pavol/media/radio-1.svg',
        source: 'Rádio 1',
        importance: 'highlight',
        thumbnailClassName: 'bg-[#ed1c24] text-white',
        copy: {
            cs: {
                kind: 'Podcast',
                title: 'Zátiší: Pavol Hejný & Tomáš Studeník',
                description:
                    'Rozhovor v pořadu Zátiší o tom, kam se může vyvíjet AI, jak ji efektivně používat v každodenním životě a kde být opatrný.',
            },
            en: {
                kind: 'Podcast',
                title: 'Zátiší: Pavol Hejný & Tomáš Studeník',
                description:
                    'An interview on the Zátiší program about where AI may be heading, how to use it effectively in everyday life, and where to be cautious.',
            },
        },
    },
    {
        href: 'https://www.datatalk.cz/podcast/epizoda-157',
        imageSrc: '/pavol/media/datatalk-podcast.jpg',
        source: 'DataTalk',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Podcast',
                title: 'Data Talk #speciál: Podcastový průřez feat. AI ta Krajta',
                description:
                    'Dlouhý rozhovor o AI ve vývoji softwaru, budoucnosti vývojářských nástrojů a o tom, proč vznikla AI ta Krajta.',
            },
            en: {
                kind: 'Podcast',
                title: 'Data Talk Special: Podcast crossover feat. AI ta Krajta',
                description:
                    'A long interview about AI in software development, the future of developer tools, and why AI ta Krajta was created.',
            },
        },
    },
    {
        href: 'https://devconfcz2023.sched.com/event/1MYeB/2023s-most-interesting-browser-apis',
        source: 'DevConf.CZ',
        importance: 'rest',
        thumbnailLabel: 'dc',
        thumbnailClassName: 'bg-[#6f3cc3] text-white',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'Most interesting browser APIs',
                description:
                    'Přednáška z DevConf.CZ o zajímavých webových API, včetně Web Speech API, Sensor APIs, WebXR, Offscreen Canvas a File System Access API.',
            },
            en: {
                kind: 'Talk',
                title: 'Most interesting browser APIs',
                description:
                    'A DevConf.CZ talk about interesting web APIs, including Web Speech API, Sensor APIs, WebXR, Offscreen Canvas, and File System Access API.',
            },
        },
    },
    {
        href: 'https://www.youtube.com/watch?v=K0eMvbSID44',
        imageSrc: '/pavol/media/openalt-talk.jpg',
        source: 'OpenAlt',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'Vývoj modulárních aplikací pro online vzdělávání',
                description:
                    'Přednáška o navrhování modulárních aplikací a technickém zázemí digitálních produktů pro školství.',
            },
            en: {
                kind: 'Talk',
                title: 'Building modular apps for online education',
                description:
                    'A talk about designing modular applications and the technical background of digital products for education.',
            },
        },
    },
    {
        href: 'https://www.youtube.com/watch?v=V9Jd2VfMZoA',
        imageSrc: '/pavol/media/sit-port-podcast.jpg',
        source: 'SIT Port',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Podcast',
                title: 'Pavol Hejný a Collboard',
                description:
                    'Rozhovor o Collboardu, vzdělávání a tom, jak vznikají produkty na pomezí technologie a společenského dopadu.',
            },
            en: {
                kind: 'Podcast',
                title: 'Podcast: Pavol Hejný and Collboard',
                description:
                    'An interview about Collboard, education, and how products are created at the intersection of technology and social impact.',
            },
        },
    },
    {
        href: 'https://www.youtube.com/watch?v=i7gQtatWSKc',
        imageSrc: '/pavol/media/linuxdays-talk.jpg',
        source: 'LinuxDays',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Přednáška',
                title: 'LinuxDays - Užitečná browser APIs',
                description:
                    'Technická přednáška o méně známých browser API a o tom, kde mohou vývojářům ušetřit práci.',
            },
            en: {
                kind: 'Talk',
                title: 'LinuxDays - Useful browser APIs',
                description:
                    'A technical talk about lesser-known browser APIs and where they can save developers work.',
            },
        },
    },
    {
        href: 'https://www.euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/',
        imageSrc: '/pavol/media/euro-article.jpg',
        source: 'Euro.cz',
        importance: 'rest',
        copy: {
            cs: {
                kind: 'Článek',
                title: 'Digitální škamny. Pandemie rozpohybovala zkostnatělé české školství',
                description:
                    'Mediální výstup o změnách ve školství, digitalizaci a projektech, které vznikaly kolem online výuky.',
            },
            en: {
                kind: 'Article',
                title: 'Digital school desks: the pandemic shook Czech education awake',
                description:
                    'A media appearance about changes in education, digitalization, and projects that emerged around online teaching.',
            },
        },
    },
];

function localizeMediaAppearance(
    language: SupportedHomepageLanguage,
    appearance: SharedMediaAppearance,
): PavolMediaAppearance {
    const { copy, ...sharedAppearance } = appearance;

    return {
        ...sharedAppearance,
        ...copy[language],
    };
}

export const pavolMediaAppearances: Record<SupportedHomepageLanguage, PavolMediaAppearance[]> = {
    cs: sharedMediaAppearances.map((appearance) => localizeMediaAppearance('cs', appearance)),
    en: sharedMediaAppearances.map((appearance) => localizeMediaAppearance('en', appearance)),
};
