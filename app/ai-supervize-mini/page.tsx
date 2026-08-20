import { AiSupervizeMiniPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniPage';
import { AI_SUPERVIZE_MINI_METADATA } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { loadAiSupervizeMiniWorkshopAvailability } from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';

export const metadata = AI_SUPERVIZE_MINI_METADATA;
export const dynamic = 'force-dynamic';

type AiSupervizeMiniRouteProps = {
    readonly searchParams: Promise<{
        readonly code?: string | string[];
    }>;
};

export default async function AiSupervizeMiniRoute({ searchParams }: AiSupervizeMiniRouteProps) {
    const resolvedSearchParams = await searchParams;
    const initialDiscountCode = readFirstSearchParameter(resolvedSearchParams.code) ?? '';
    const workshopAvailabilities = await loadAiSupervizeMiniWorkshopAvailability();

    return (
        <AiSupervizeMiniPage
            initialDiscountCode={initialDiscountCode}
            workshopAvailabilities={workshopAvailabilities}
        />
    );
}
