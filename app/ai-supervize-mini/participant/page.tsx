import { AiSupervizeMiniParticipantPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniParticipantPage';
import type { Metadata } from 'next';

type ParticipantRouteProps = {
    searchParams: Promise<{
        registration?: string | string[];
    }>;
};

export const metadata: Metadata = {
    title: 'Informace pro účastníka | AI Supervize Mini',
    description:
        'Praktické informace, harmonogram a příprava pro registrované účastníky jednodenního workshopu AI Supervize Mini.',
    alternates: {
        canonical: '/ai-supervize-mini/participant',
    },
    robots: {
        index: false,
        follow: false,
    },
};

function getSingleSearchParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0]?.trim() || null;
    }

    return value?.trim() || null;
}

export default async function AiSupervizeMiniParticipantRoute({ searchParams }: ParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const registrationId = getSingleSearchParam(resolvedSearchParams.registration);

    return <AiSupervizeMiniParticipantPage registrationId={registrationId} />;
}
