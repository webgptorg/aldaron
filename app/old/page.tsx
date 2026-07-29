import { OldHomePageComponent } from '@/businesses/_generic/_HomePage';
import { OLD_HOMEPAGE_METADATA } from '@/businesses/_generic/defaultMetadata';
import { Metadata } from 'next';

export const metadata: Metadata = OLD_HOMEPAGE_METADATA;

export default function OldHomePage() {
    return <OldHomePageComponent />;
}
