import { PricingSection } from '@/components/pricing-section';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
    return {
        title: 'Pricing – Promptbook (Embed)',
        description: 'Simple, transparent pricing for your AI avatar. Start free and scale as you grow.',
    };
}

export default function PricingFramePage() {
    return (
        <main className="min-h-screen bg-transparent">
            <PricingSection />
        </main>
    );
}
