import { OnlineWorkshopParticipantPage } from '@/businesses/online-workshop/_OnlineWorkshopParticipantPage';
import { ONLINE_WORKSHOP_PARTICIPANT_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';

export const metadata = ONLINE_WORKSHOP_PARTICIPANT_METADATA;

export default function CsOnlineWorkshopParticipantRoute() {
    return <OnlineWorkshopParticipantPage />;
}
