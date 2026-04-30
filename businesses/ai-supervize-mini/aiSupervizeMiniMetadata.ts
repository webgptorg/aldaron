import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const aiSupervizeMiniMetadata: Metadata = {
    title: 'AI Supervize Mini | Celodenní workshop pro jednotlivce',
    description:
        'Hands-on workshop v Praze pro vývojáře a produkťáky v TypeScriptu nebo JavaScriptu: nástroje, rizika, verzování, testování a code quality v AI vývoji.',
    alternates: {
        canonical: '/ai-supervize-mini',
    },
    openGraph: {
        type: 'website',
        title: 'AI Supervize Mini | Promptbook',
        description:
            'Jednodenní workshop, jak komplexně přemýšlet nad AI vývojem od zadání po merge. Praha, max 10 účastníků.',
        url: 'https://ptbk.io/ai-supervize-mini',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI Supervize Mini - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI Supervize Mini | Promptbook',
        description: 'Celodenní hands-on workshop pro vývojáře a produkťáky v TypeScriptu / JavaScriptu.',
    },
};
