import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { TeamSection } from '@/components/team-section';
import { CONTACT_METADATA } from '@/lib/metadata/site-page-definitions';
import type { Metadata } from 'next';

export const metadata: Metadata = CONTACT_METADATA;

export default function ContactPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <br />
            <br />
            <br />
            <TeamSection />
            <Footer />
        </div>
    );
}
