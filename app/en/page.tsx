import { Homepage } from '@/config/homepage/_Homepage';
import { homepageContent } from '@/config/homepage/homepageContent';
import { Metadata } from 'next';

export const metadata: Metadata = homepageContent.en.metadata;

export default function HomePage() {
    return <Homepage language="en" />;
}
