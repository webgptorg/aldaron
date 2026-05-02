import { PAVOL_CV_URL, pavolContent, type PavolLanguage } from '@/businesses/pavol/pavolContent';
import pavolOgImage from '@/public/people/pavol-hejny-transparent-square.png';
import type { Metadata } from 'next';

export function getPavolMetadata(language: PavolLanguage): Metadata {
    const content = pavolContent[language];
    const alternateLanguage = language === 'cs' ? 'en' : 'cs';

    return {
        title: content.metadata.title,
        description: content.metadata.description,
        authors: [{ name: 'Pavol Hejný', url: PAVOL_CV_URL }],
        alternates: {
            canonical: content.metadata.canonical,
            languages: {
                [language]: content.metadata.canonical,
                [alternateLanguage]: `/pavol/${alternateLanguage}`,
            },
        },
        openGraph: {
            type: 'website',
            title: content.metadata.title,
            description: content.metadata.description,
            url: `https://ptbk.io${content.metadata.canonical}`,
            locale: content.metadata.locale,
            images: [
                {
                    url: pavolOgImage.src,
                    width: pavolOgImage.width,
                    height: pavolOgImage.height,
                    alt: 'Pavol Hejný',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: content.metadata.title,
            description: content.metadata.description,
            images: [pavolOgImage.src],
        },
    };
}
