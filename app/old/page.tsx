import { OldHomePageComponent } from '@/businesses/_generic/_HomePage';
import { oldDefaultMetadata } from '@/businesses/_generic/defaultMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = oldDefaultMetadata;

export default function OldHomePage() {
    return <OldHomePageComponent />;
}
