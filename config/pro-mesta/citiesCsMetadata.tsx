import { Metadata } from 'next';
import ogImage from './cities-cs-og-image.png';
// <- TODO: !!! [🌆] `/pro-mesta` OG image specific for cities

export const citiesCsMetadata: Metadata = {
    title: 'AI odborník, který mluví jazykem Vaší obce',
    description: 'Pomáháme samosprávám vytvářet kontext pro AI.',
    alternates: {
        canonical: '/pro-mesta',
    },
    openGraph: {
        type: 'website',
        title: 'AI odborník, který mluví jazykem Vaší obce',
        description: 'Pomáháme samosprávám vytvářet kontext pro AI',
        url: 'https://ptbk.io/pro-mesta',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI odborník, který mluví jazykem Vaší obce - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI odborník, který mluví jazykem Vaší obce',
        description: 'Pomáháme samosprávám vytvářet kontext pro AI',
    },
};
