import { OnlineWorkshopPage } from '@/businesses/online-workshop/_OnlineWorkshopPage';
import {
    createOnlineWorkshopStructuredData,
    ONLINE_WORKSHOP_METADATA,
} from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { StructuredData } from '@/components/structured-data';
import { loadUpcomingPublishedWorkshopSummaries } from '@/lib/workshops/workshopPublic';

export const metadata = ONLINE_WORKSHOP_METADATA;
export const dynamic = 'force-dynamic';

export default async function CsOnlineWorkshopRoute() {
    const workshops = await loadUpcomingPublishedWorkshopSummaries();

    return (
        <>
            <StructuredData nodes={createOnlineWorkshopStructuredData(workshops)} />
            <OnlineWorkshopPage workshops={workshops} />
        </>
    );
}
