import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const aiSupervizeMetadata: Metadata = {
    title: 'AI Supervize pro software týmy | Promptbook',
    description:
        'Pomáháme CTO, CEO a Tech Leadům zavést AI coding bezpečně, měřitelně a bez chaosu v delivery workflow.',
    alternates: {
        canonical: '/ai-supervize',
    },
    openGraph: {
        type: 'website',
        title: 'AI Supervize pro software týmy | Promptbook',
        description:
            'Pomáháme CTO, CEO a Tech Leadům zavést AI coding bezpečně, měřitelně a bez chaosu v delivery workflow.',
        url: 'https://ptbk.io/ai-supervize',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI Supervize pro software týmy - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI Supervize pro software týmy | Promptbook',
        description:
            'Pomáháme CTO, CEO a Tech Leadům zavést AI coding bezpečně, měřitelně a bez chaosu v delivery workflow.',
    },
};
