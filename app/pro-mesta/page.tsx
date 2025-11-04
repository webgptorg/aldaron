import { CitiesCsPage } from '@/config/pro-mesta/CitiesCsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Transformation for Cities and Municipalities - Promptbook',
    description:
        'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
    alternates: {
        canonical: '/pro-mesta',
    },
    openGraph: {
        title: 'AI Transformation for Cities and Municipalities - Promptbook',
        description:
            'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
        url: 'https://ptbk.io/pro-mesta',
    },
    twitter: {
        title: 'AI Transformation for Cities and Municipalities - Promptbook',
        description:
            'With Promptbook, you can capture the context, rules, and knowledge of your organization into simple documents and create AI agents that perfectly match your needs.',
    },
};
// <- TODO: !!! Import metadata from '@/config/pro-mesta/citiesCsMetadata';

export default function ProMestaPage() {
    return <CitiesCsPage />;
}
