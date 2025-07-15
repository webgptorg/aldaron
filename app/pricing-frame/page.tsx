'use client';

import { PricingSection } from '@/components/pricing-section';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PricingFrameContent() {
    const searchParams = useSearchParams();
    const currentPlan = searchParams.get('currentPlan') as 'FREE' | 'PRO' | 'ENTERPRISE' | null;

    return (
        <main className="min-h-screen bg-white">
            <PricingSection hideHeader isFrame currentPlan={currentPlan || undefined} />
        </main>
    );
}

export default function PricingFramePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <PricingFrameContent />
        </Suspense>
    );
}
