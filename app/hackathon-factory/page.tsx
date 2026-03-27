import { HackathonFactoryPage } from '@/config/hackathon-factory/_HackathonFactoryPage';
import { hackathonFactoryMetadata } from '@/config/hackathon-factory/hackathonFactoryMetadata';

export const metadata = hackathonFactoryMetadata;

export default function HackathonFactoryRoute() {
    return <HackathonFactoryPage />;
}
