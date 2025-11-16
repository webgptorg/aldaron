import { Metadata } from 'next';
import ogImage from './cities-cs-og-image.png';
// <- TODO: !!! [🌆] `/pro-mesta` OG image specific for cities

// TODO: !!! [🌆] `/pro-mesta` Translate

export const citiesCsMetadata: Metadata = {
    title: 'AI Transformation for Cities and Municipalities - Promptbook',
    description:
        'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
    alternates: {
        canonical: '/pro-mesta',
    },
    openGraph: {
        type: 'website',
        title: 'AI Transformation for Cities and Municipalities - Promptbook',
        description:
            'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
        url: 'https://ptbk.io/pro-mesta',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI Transformation for Cities and Municipalities - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI Transformation for Cities and Municipalities - Promptbook',
        description:
            'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
    },
};
