import { Metadata } from 'next';

export const defaultMetadataTitle = 'Promptbook - Create AI that Truly Understands Your Business';
export const defaultMetadataDescription =
    "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.";
export const defaultMetadataOpenGraphAlt = 'Promptbook - Create AI that truly understands your business';


/**
 * @deprecated using new page from Neonmedia
 */
export const oldDefaultMetadata: Metadata = {
    title: defaultMetadataTitle,
    description: defaultMetadataDescription,
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        title: defaultMetadataTitle,
        description: defaultMetadataDescription,
        url: 'https://ptbk.io',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: defaultMetadataOpenGraphAlt,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: defaultMetadataTitle,
        description: defaultMetadataDescription,
        images: ['/twitter-image'],
    },
};
