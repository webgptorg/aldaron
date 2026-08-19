import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { ONLINE_WORKSHOP_PARTICIPANT_PATH, onlineWorkshopConfig } from '@/businesses/online-workshop/config';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';

type OnlineWorkshopParticipantRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;

export default async function OnlineWorkshopParticipantRoute({ searchParams }: OnlineWorkshopParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={onlineWorkshopConfig.workshopSlug}
            connectionDetails={{
                title: onlineWorkshopConfig.participant.title,
                description: onlineWorkshopConfig.participant.description,
                dateLabel: `${onlineWorkshopConfig.date.weekdayLabel} ${onlineWorkshopConfig.date.dateLabel} · ${onlineWorkshopConfig.date.time}`,
                durationLabel: onlineWorkshopConfig.date.durationLabel,
            }}
            calendarDetails={{
                hostFullname: onlineWorkshopConfig.host.fullname,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
            }}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
        />
    );
}
