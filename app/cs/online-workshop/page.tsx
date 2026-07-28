import { OnlineWorkshopPage } from '@/businesses/online-workshop/_OnlineWorkshopPage';
import { onlineWorkshopMetadata } from '@/businesses/online-workshop/onlineWorkshopMetadata';

export const metadata = onlineWorkshopMetadata;

export default function CsOnlineWorkshopRoute() {
    return <OnlineWorkshopPage />;
}
