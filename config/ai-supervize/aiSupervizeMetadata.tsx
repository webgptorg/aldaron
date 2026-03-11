import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const aiSupervizeMetadata: Metadata = {
    title: 'AI Supervize pro vývojové týmy | Promptbook',
    description:
        'Praktický program pro CTO, CEO a Tech Leady: rozhodnutí, plán, playbook, šablony a měřitelné metriky pro bezpečné a opakovatelné používání AI ve vývoji.',
    alternates: {
        canonical: '/ai-supervize',
    },
    openGraph: {
        type: 'website',
        title: 'AI Supervize pro vývojové týmy | Promptbook',
        description:
            'Zkraťte time-to-merge, snižte rework a regresní chyby. AI Supervize nastaví workflow, pravidla a nástroje pro váš konkrétní tým.',
        url: 'https://ptbk.io/ai-supervize',
        images: [
            {
                url: ogImage.src,
                width: 1860,
                height: 992,
                alt: 'AI Supervize pro vývojové týmy - Promptbook',
            },
        ],
    },
    twitter: {
        title: 'AI Supervize pro vývojové týmy | Promptbook',
        description:
            'Praktický program pro CTO, CEO a Tech Leady: playbook, šablony a metriky pro bezpečné používání AI ve vývoji.',
    },
};
