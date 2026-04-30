import { Metadata } from 'next';

export const citiesCsMetadataTitle = 'AI odborník, který mluví jazykem Vaší obce';
export const citiesCsMetadataDescription =
    'Promptbook pomáhá samosprávám proměnit interní pravidla, znalosti a procesy ve spolehlivého AI odborníka pro úřad.';
export const citiesCsMetadataOpenGraphAlt = 'Promptbook pro města a obce - AI odborník, který mluví jazykem Vaší obce';

export const citiesCsMetadata: Metadata = {
    title: citiesCsMetadataTitle,
    description: citiesCsMetadataDescription,
    alternates: {
        canonical: '/pro-mesta',
    },
    openGraph: {
        type: 'website',
        locale: 'cs_CZ',
        title: citiesCsMetadataTitle,
        description: citiesCsMetadataDescription,
        url: 'https://ptbk.io/pro-mesta',
        images: [
            {
                url: '/pro-mesta/opengraph-image',
                width: 1200,
                height: 630,
                alt: citiesCsMetadataOpenGraphAlt,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: citiesCsMetadataTitle,
        description: citiesCsMetadataDescription,
        images: ['/pro-mesta/twitter-image'],
    },
};
