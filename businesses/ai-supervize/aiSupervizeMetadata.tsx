import ogImage from '@/public/logo/og-image.png';
import { Metadata } from 'next';

export const aiSupervizeMetadata: Metadata = {
    title: 'AI Supervize pro software týmy | Promptbook',
    description:
        'Pomáháme firmám nastavit workflow, pravidla, nástroje a měření tak, aby AI opravdu pomáhala při vývoji software, místo aby přidávala chaos a riziko.',
    alternates: {
        canonical: '/ai-supervize',
    },
    openGraph: {
        type: 'website',
        title: 'AI Supervize pro software týmy | Promptbook',
        description:
            'Workflow, pravidla, playbook a metriky, díky kterým AI zkracuje time-to-merge místo přidávání chaosu.',
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
            'Workflow, pravidla, playbook a metriky, díky kterým AI zkracuje time-to-merge místo přidávání chaosu.',
    },
};
