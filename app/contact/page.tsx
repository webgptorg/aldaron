import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { TeamSection } from '@/components/team-section';
import { CONTACT_METADATA } from '@/lib/metadata/site-page-definitions';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = CONTACT_METADATA;

export default function ContactPage() {
    return (
        <div className="min-h-screen">
            <Header />
            <br />
            <br />
            <br />
            <TeamSection
                title="The people behind Promptbook"
                description="We build practical AI for companies. Our backgrounds are in technology, research, and business."
                jiriDescription={
                    <>
                        Jiří has a Ph.D. in mathematics and used to be a researcher at{' '}
                        <Link href="https://www.it4i.cz/">IT4I National Supercomputing Centre</Link>.
                    </>
                }
                pavolDescription={
                    <>
                        Pavol is one of the top <Link href="https://www.pavolhejny.com/">open-source contributors</Link>{' '}
                        in Czechia. He has more than 15 years of experience as a developer.
                    </>
                }
            />
            <Footer />
        </div>
    );
}
