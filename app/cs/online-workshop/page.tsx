import { OnlineWorkshopPage } from '@/businesses/online-workshop/_OnlineWorkshopPage';
import { ONLINE_WORKSHOP_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';

export const metadata = ONLINE_WORKSHOP_METADATA;

export default function CsOnlineWorkshopRoute() {
    return <OnlineWorkshopPage />;
}
