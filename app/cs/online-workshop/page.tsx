import { OnlineWorkshopPage } from '@/businesses/online-workshop/_OnlineWorkshopPage';
import { ONLINE_WORKSHOP_METADATA } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { loadUpcomingPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';

export const metadata = ONLINE_WORKSHOP_METADATA;
export const dynamic = 'force-dynamic';

export default async function CsOnlineWorkshopRoute() {
    const workshops = await loadUpcomingPublishedWorkshopSummaries();
    return <OnlineWorkshopPage workshops={workshops} />;
}
