import { OnlineWorkshopThankYouPage } from '@/businesses/online-workshop/_OnlineWorkshopThankYouPage';
import { ONLINE_WORKSHOP_PARTICIPANT_PATH } from '@/businesses/online-workshop/config';
import { ONLINE_WORKSHOP_THANK_YOU_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { createWorkshopParticipantLink, readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';

type OnlineWorkshopThankYouRouteProps = {
    readonly searchParams: Promise<{
        readonly email?: string | string[];
        readonly fullname?: string | string[];
    }>;
};

export const metadata = ONLINE_WORKSHOP_THANK_YOU_METADATA;

export default async function CsOnlineWorkshopThankYouRoute({ searchParams }: OnlineWorkshopThankYouRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );
    const participantLink = createWorkshopParticipantLink(ONLINE_WORKSHOP_PARTICIPANT_PATH, participantIdentity);

    return <OnlineWorkshopThankYouPage participantLink={participantLink} />;
}
