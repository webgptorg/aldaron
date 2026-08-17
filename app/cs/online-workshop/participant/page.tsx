import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { onlineWorkshopConfig } from '@/businesses/online-workshop/config';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
} from '@/lib/workshops/workshopConstants';

type OnlineWorkshopParticipantRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;

function readPrefilledValue(value: string | string[] | undefined, maximalLength: number): string {
    return readFirstSearchParameter(value)?.trim().slice(0, maximalLength) ?? '';
}

export default async function OnlineWorkshopParticipantRoute({ searchParams }: OnlineWorkshopParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={onlineWorkshopConfig.workshopSlug}
            connectionDetails={{
                title: onlineWorkshopConfig.participant.title,
                description: onlineWorkshopConfig.participant.description,
                dateLabel: `${onlineWorkshopConfig.date.weekdayLabel} ${onlineWorkshopConfig.date.dateLabel} · ${onlineWorkshopConfig.date.time}`,
                durationLabel: onlineWorkshopConfig.date.durationLabel,
            }}
            initialEmail={readPrefilledValue(resolvedSearchParams.email, MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH)}
            initialFullname={readPrefilledValue(
                resolvedSearchParams.fullname,
                MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH,
            )}
        />
    );
}
