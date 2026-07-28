import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const onlineWorkshopMetadata: Metadata = {
    title: 'Promptbook | Online workshop zdarma',
    description:
        'Jak s AI agenty psát produkční kód, aniž bys po nich všechno přepisoval. 60minutový online workshop naživo pro tech leady, CTO a vývojáře, kteří už používají Claude Code, Cursor, Copilot nebo Codex.',
    alternates: {
        canonical: '/cs/online-workshop',
    },
    openGraph: {
        type: 'website',
        title: 'Online workshop zdarma | Promptbook',
        description:
            'Naživo uvidíš, kde přesně se AI agenti lámou na reálných projektech a jak z nich dostat produkční kód. Zdarma, 60 minut + Q&A.',
        url: 'https://ptbk.io/cs/online-workshop',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'Online workshop zdarma - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'Online workshop zdarma | Promptbook',
        description: 'Jak s AI agenty psát produkční kód, aniž bys po nich všechno přepisoval. Zdarma, naživo.',
    },
};
