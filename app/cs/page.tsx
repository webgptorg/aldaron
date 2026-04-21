import { ProFirmyPage } from '@/config/pro-firmy/_ProFirmyPage';
import { proFirmyMetadata } from '@/config/pro-firmy/proFirmyMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = proFirmyMetadata;

export default function HomePage() {
    return <ProFirmyPage />;
}
