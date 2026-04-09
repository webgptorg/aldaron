import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const hackathonFactoryMetadata: Metadata = {
    title: 'Hackathon Factory | Reálné problémy, funkční výstupy',
    description:
        'Hackathon Factory propojuje lidi s reálnými problémy a developery, kteří je během krátkého sprintu dotáhnou do prototypu, rozhodnutí nebo plánu.',
    alternates: {
        canonical: '/hackathon-factory',
    },
    openGraph: {
        type: 'website',
        title: 'Hackathon Factory | Reálné problémy, funkční výstupy',
        description:
            'Krátké hackathon sprinty pro CTO, startupy a vývojáře, kteří chtějí stavět. Cíl: funkční prototyp, rozhodnutí nebo plán použitelný hned další den.',
        url: 'https://ptbk.io/hackathon-factory',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'Hackathon Factory',
            },
        ],
    },
    twitter: {
        title: 'Hackathon Factory | Reálné problémy, funkční výstupy',
        description:
            'Krátké hackathon sprinty pro CTO, startupy a vývojáře, kteří chtějí stavět. Cíl: funkční prototyp, rozhodnutí nebo plán použitelný hned další den.',
    },
};
