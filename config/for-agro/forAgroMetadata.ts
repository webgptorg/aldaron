import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

const title = 'AI pro agronomii a zemědělské společnosti | Promptbook';
const description =
    'Pomáháme zemědělským společnostem převést agronomické know-how, compliance a provozní postupy do AI agentů, kteří fungují napříč regiony.';

export const forAgroMetadata: Metadata = {
    title,
    description,
    keywords: [
        'AI pro agronomii',
        'zemědělství',
        'agronomie',
        'zemědělské společnosti',
        'compliance',
        'Promptbook',
    ],
    authors: [{ name: 'Promptbook' }],
    alternates: {
        canonical: '/for-agro',
    },
    openGraph: {
        type: 'website',
        title,
        description,
        url: 'https://ptbk.io/for-agro',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI pro agronomii a zemědělské společnosti - Promptbook',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage.src],
    },
};
