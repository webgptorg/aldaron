import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

export type PavolMediaAppearance = {
    href: string;
    imageSrc: string;
    source: string;
    kind: string;
    title: string;
    description: string;
};

const linkedInProfileHref = 'https://www.linkedin.com/in/hejny/';
const linkedInProfileImageSrc = '/pavol/media/linkedin-profile.svg';

const linkedInProfileAppearance: Record<SupportedHomepageLanguage, PavolMediaAppearance> = {
    cs: {
        href: linkedInProfileHref,
        imageSrc: linkedInProfileImageSrc,
        source: 'LinkedIn',
        kind: 'Profil',
        title: 'Další vystoupení a aktuality na LinkedIn',
        description:
            'Průběžné postřehy, sdílené materiály a další veřejné výstupy k AI, vývoji softwaru, produktům a vzdělávání.',
    },
    en: {
        href: linkedInProfileHref,
        imageSrc: linkedInProfileImageSrc,
        source: 'LinkedIn',
        kind: 'Profile',
        title: 'More appearances and updates on LinkedIn',
        description:
            'Ongoing notes, shared materials, and additional public posts about AI, software development, product work, and education.',
    },
};

const localizedMediaAppearances: Record<SupportedHomepageLanguage, PavolMediaAppearance[]> = {
    cs: [
        {
            href: 'https://www.youtube.com/@aitakrajta_tv',
            imageSrc: '/pavol/media/ai-ta-krajta.jpg',
            source: 'YouTube',
            kind: 'Video podcast',
            title: 'AI ta Krajta TV',
            description:
                'Pravidelný video podcast o AI infrastruktuře, agentních workflow a tom, kam se posouvá software engineering.',
        },
        {
            href: 'https://www.datatalk.cz/podcast/epizoda-157',
            imageSrc: '/pavol/media/datatalk-podcast.jpg',
            source: 'DataTalk',
            kind: 'Podcast',
            title: 'Data Talk #speciál: Podcastový průřez feat. AI ta Krajta',
            description:
                'Dlouhý rozhovor o AI ve vývoji softwaru, budoucnosti vývojářských nástrojů a o tom, proč vznikla AI ta Krajta.',
        },
        {
            href: 'https://www.youtube.com/watch?v=K0eMvbSID44',
            imageSrc: '/pavol/media/openalt-talk.jpg',
            source: 'OpenAlt',
            kind: 'Přednáška',
            title: 'Vývoj modulárních aplikací pro online vzdělávání',
            description:
                'Přednáška o navrhování modulárních aplikací a technickém zázemí digitálních produktů pro školství.',
        },
        {
            href: 'https://www.youtube.com/watch?v=V9Jd2VfMZoA',
            imageSrc: '/pavol/media/sit-port-podcast.jpg',
            source: 'SIT Port',
            kind: 'Podcast',
            title: 'PODCAST: Pavol Hejný a Collboard',
            description:
                'Rozhovor o Collboardu, vzdělávání a tom, jak vznikají produkty na pomezí technologie a společenského dopadu.',
        },
        {
            href: 'https://www.youtube.com/watch?v=i7gQtatWSKc',
            imageSrc: '/pavol/media/linuxdays-talk.jpg',
            source: 'LinuxDays',
            kind: 'Přednáška',
            title: 'LinuxDays 2018 - Užitečná browser APIs',
            description: 'Technická přednáška o méně známých browser API a o tom, kde mohou vývojářům ušetřit práci.',
        },
        {
            href: 'https://www.euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/',
            imageSrc: '/pavol/media/euro-article.jpg',
            source: 'Euro.cz',
            kind: 'Článek',
            title: 'Digitální škamny. Pandemie rozpohybovala zkostnatělé české školství',
            description:
                'Mediální výstup o změnách ve školství, digitalizaci a projektech, které vznikaly kolem online výuky.',
        },
    ],
    en: [
        {
            href: 'https://www.youtube.com/@aitakrajta_tv',
            imageSrc: '/pavol/media/ai-ta-krajta.jpg',
            source: 'YouTube',
            kind: 'Video podcast',
            title: 'AI ta Krajta TV',
            description:
                'A weekly Czech video podcast about AI infrastructure, agent workflows, and how software engineering is changing.',
        },
        {
            href: 'https://www.datatalk.cz/podcast/epizoda-157',
            imageSrc: '/pavol/media/datatalk-podcast.jpg',
            source: 'DataTalk',
            kind: 'Podcast',
            title: 'Data Talk Special: Podcast crossover feat. AI ta Krajta',
            description:
                'A long-form conversation about AI in software development, the future of developer tooling, and why AI ta Krajta exists.',
        },
        {
            href: 'https://www.youtube.com/watch?v=K0eMvbSID44',
            imageSrc: '/pavol/media/openalt-talk.jpg',
            source: 'OpenAlt',
            kind: 'Talk',
            title: 'Building modular apps for online education',
            description:
                'A talk about modular application design and the technical foundations behind digital products for schools.',
        },
        {
            href: 'https://www.youtube.com/watch?v=V9Jd2VfMZoA',
            imageSrc: '/pavol/media/sit-port-podcast.jpg',
            source: 'SIT Port',
            kind: 'Podcast',
            title: 'Podcast: Pavol Hejný and Collboard',
            description:
                'A conversation about Collboard, education, and how products emerge at the intersection of technology and public impact.',
        },
        {
            href: 'https://www.youtube.com/watch?v=i7gQtatWSKc',
            imageSrc: '/pavol/media/linuxdays-talk.jpg',
            source: 'LinuxDays',
            kind: 'Talk',
            title: 'Useful browser APIs',
            description:
                'A technical session on lesser-known browser APIs and the places where they can save developers real work.',
        },
        {
            href: 'https://www.euro.cz/clanky/digitalni-skamny-pandemie-rozpohybovala-zkostnatele-ceske-skolstvi/',
            imageSrc: '/pavol/media/euro-article.jpg',
            source: 'Euro.cz',
            kind: 'Article',
            title: 'Digital school desks: the pandemic shook Czech education awake',
            description:
                'A media appearance about change in education, digital transformation, and projects built around remote teaching.',
        },
    ],
};

export const pavolMediaAppearances: Record<SupportedHomepageLanguage, PavolMediaAppearance[]> = {
    cs: [...localizedMediaAppearances.cs, linkedInProfileAppearance.cs],
    en: [...localizedMediaAppearances.en, linkedInProfileAppearance.en],
};
