import { HomePageComponent } from '@/config/_generic/_HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
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
    },
    twitter: {
        title: 'Promptbook - Create AI that Truly Understands Your Business',
        description:
            "With Promptbook, you can capture your company's context, rules, and knowledge into simple Books to build AI agents that align perfectly with your business needs.",
    },
};
// <- TODO: !!! Import metadata from '@/config/_generic/defaultPageMetadata';

export default function HomePage() {
    return <HomePageComponent />;
}
