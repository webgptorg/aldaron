import { HackathonFactoryPage } from '@/businesses/hackathon-factory/_HackathonFactoryPage';
import { hackathonFactoryMetadata } from '@/businesses/hackathon-factory/hackathonFactoryMetadata';

export const metadata = hackathonFactoryMetadata;

export default function HackathonFactoryRoute() {
    return <HackathonFactoryPage />;
}
