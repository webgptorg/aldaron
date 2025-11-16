import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
    title: 'Promptbook - Create AI that Truly Understands Your Business',
    description:
        "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Promptbook - Create AI that Truly Understands Your Business',
        description:
            "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
        url: 'https://ptbk.io',
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
        title: 'Promptbook - Create AI that Truly Understands Your Business',
        description:
            "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    },
};
