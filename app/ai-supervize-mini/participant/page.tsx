import { AI_SUPERVIZE_MINI_PARTICIPANT_METADATA } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { AiSupervizeMiniParticipantPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniParticipantPage';
import type { Metadata } from 'next';

type ParticipantRouteProps = {
    searchParams: Promise<{
        registration?: string | string[];
    }>;
};

export const metadata: Metadata = AI_SUPERVIZE_MINI_PARTICIPANT_METADATA;

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
