import { Homepage } from '@/businesses/homepage/_Homepage';
import { homepageContent } from '@/businesses/homepage/homepageContent';
import { Metadata } from 'next';

export const metadata: Metadata = homepageContent.cs.metadata;

export default function HomePage() {
    return <Homepage language="cs" />;
}
