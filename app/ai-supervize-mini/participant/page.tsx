import { AI_SUPERVIZE_MINI_PARTICIPANT_METADATA } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { AiSupervizeMiniParticipantPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniParticipantPage';
import { loadAiSupervizeMiniEvents } from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { findEventOccurrenceByLocationKind } from '@/lib/events/eventSummary';
import type { Metadata } from 'next';

type ParticipantRouteProps = {
    searchParams: Promise<{
        registration?: string | string[];
    }>;
};

export const metadata: Metadata = AI_SUPERVIZE_MINI_PARTICIPANT_METADATA;

// The term this page describes is administered rather than built into it, so the page is rendered per request.
export const dynamic = 'force-dynamic';

function getSingleSearchParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0]?.trim() || null;
    }

    return value?.trim() || null;
}

export default async function AiSupervizeMiniParticipantRoute({ searchParams }: ParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const registrationId = getSingleSearchParam(resolvedSearchParams.registration);

    // This page describes the day somewhere in Prague, so it follows the next term which is really held there.
    const events = await loadAiSupervizeMiniEvents();
    const onsiteEvent = findEventOccurrenceByLocationKind(events, 'onsite');

    return <AiSupervizeMiniParticipantPage registrationId={registrationId} event={onsiteEvent} />;
}
