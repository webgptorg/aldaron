import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/participant/OnlineWorkshopParticipantPage';
import { ONLINE_WORKSHOP_HOST_FULLNAME, ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import {
    readWorkshopParticipantIdentity,
    readWorkshopSlug,
} from '@/lib/workshops/workshopParticipantLink';
import {
    formatCzechWorkshopDate,
    formatCzechWorkshopDuration,
    formatCzechWorkshopTime,
} from '@/lib/workshops/workshopDate';
import { loadSelectedPublishedWorkshop } from '@/lib/workshops/workshopPublic';
import { notFound } from 'next/navigation';

type OnlineWorkshopParticipantRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
        readonly workshop?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;
export const dynamic = 'force-dynamic';

export default async function OnlineWorkshopParticipantRoute({ searchParams }: OnlineWorkshopParticipantRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );
    const workshop = await loadSelectedPublishedWorkshop(readWorkshopSlug(resolvedSearchParams.workshop));
    if (workshop === null) {
        notFound();
    }

    return (
        <OnlineWorkshopParticipantPage
            workshopSlug={workshop.slug}
            connectionDetails={{
                title: workshop.title,
                description: workshop.description,
                dateLabel: `${formatCzechWorkshopDate(workshop.startsAt)} · ${formatCzechWorkshopTime(workshop.startsAt)}`,
                durationLabel: formatCzechWorkshopDuration(workshop.startsAt, workshop.endsAt),
            }}
            calendarDetails={{
                hostFullname: ONLINE_WORKSHOP_HOST_FULLNAME,
                participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
            }}
            initialEmail={participantIdentity.email}
            initialFullname={participantIdentity.fullname}
        />
    );
}
