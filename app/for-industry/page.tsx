import { BenefitsSection, Benefit } from '@/components/benefits-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { IntegrationsSection } from '@/components/integrations-section';
import { PricingSection } from '@/components/pricing-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { book } from '@promptbook/core';
import type { string_book } from '@promptbook/types';

// Force static generation for static export
export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
    return {
        title: '✨ AI for Engineering & Industry | Promptbook',
        description: 'Create AI agents for technical manuals, support, and operational procedures with Promptbook.',
    };
}

async function getBookContent(): Promise<string_book> {
    const filePath = path.join(process.cwd(), 'books', 'engineering-manual.book');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return fileContents as string_book;
}

const industryBenefits: Benefit[] = [
    {
        iconName: 'Briefcase',
        title: 'Instant Access to Technical Knowledge',
        description: 'Provide field technicians and support staff with immediate access to relevant information from technical manuals and SOPs.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        iconName: 'Zap',
        title: 'Reduce Equipment Downtime',
        description: 'Minimize downtime by empowering your team with AI-driven troubleshooting guides and maintenance procedures.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        iconName: 'Shield',
        title: 'Enhance Technical Support',
        description: 'Build AI-powered support bots that can answer complex technical questions and guide users through repairs.',
        gradient: 'from-purple-500 to-pink-500',
    },
];

export default async function ForIndustryPage() {
    const engineeringBook = await getBookContent();

    return (
        <main className="min-h-screen">
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <HeroSection initialBook={engineeringBook} />
            </Suspense>
            <BenefitsSection
                title="AI-Powered Solutions for the Engineering Industry"
                description="Streamline operations, reduce downtime, and enhance support with AI agents tailored for your industrial needs."
                benefits={industryBenefits}
            />
            <IntegrationsSection />
            {/* <AvatarBookSection /> */}
            <TestimonialsSection />
            <PricingSection />
            <Footer />
        </main>
    );
}
