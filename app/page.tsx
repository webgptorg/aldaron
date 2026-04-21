import { OldHomePageComponent } from '@/config/_generic/_HomePage';
import { defaultMetadata } from '@/config/_generic/defaultMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = defaultMetadata;

export default function OldHomePage() {
    return <OldHomePageComponent />;
}
