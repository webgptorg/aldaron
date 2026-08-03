import { HackathonFactoryPage } from '@/businesses/hackathon-factory/_HackathonFactoryPage';
import { HACKATHON_FACTORY_METADATA } from '@/businesses/hackathon-factory/hackathonFactoryMetadata';

export const metadata = HACKATHON_FACTORY_METADATA;

export default function HackathonFactoryRoute() {
    return <HackathonFactoryPage />;
}
