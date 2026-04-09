import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

/**
 * Metadata used by the agronomy landing page.
 */
export const forAgroMetadata: Metadata = {
    title: 'AI agronom pro zemědělské společnosti | Promptbook',
    description:
        'Pomáháme zemědělským firmám převést agronomické know-how, compliance a provozní postupy do AI odborníka.',
    alternates: {
        canonical: '/for-agro',
    },
    openGraph: {
        type: 'website',
        title: 'AI agronom pro zemědělské společnosti | Promptbook',
        description:
            'AI agenti pro choroby plodin, správu půdy, regulatorní compliance i dodavatelský řetězec v agronomii.',
        url: 'https://ptbk.io/for-agro',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI agronom pro zemědělské společnosti - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI agronom pro zemědělské společnosti | Promptbook',
        description:
            'AI agenti pro choroby plodin, správu půdy, regulatorní compliance i dodavatelský řetězec v agronomii.',
    },
};

