import { OldHomePageComponent } from '@/config/_generic/_HomePage';
import { oldDefaultMetadata } from '@/config/_generic/defaultMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = oldDefaultMetadata;

export default function OldHomePage() {
    return <OldHomePageComponent />;
}
