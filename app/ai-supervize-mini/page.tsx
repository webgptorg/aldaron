import { AiSupervizeMiniPage } from '@/businesses/ai-supervize-mini/_AiSupervizeMiniPage';
import { AI_SUPERVIZE_MINI_METADATA } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import {
    AI_SUPERVIZE_MINI_ONLINE_WORKSHOP_DISCOUNT_SOURCE,
} from '@/businesses/ai-supervize-mini/config';
import {
    loadAiSupervizeMiniActiveDiscount,
    loadAiSupervizeMiniOnlineWorkshopFollowUpDiscount,
} from '@/businesses/ai-supervize-mini/discountCodeDatabase';
import { loadAiSupervizeMiniWorkshopAvailability } from '@/businesses/ai-supervize-mini/workshopRegistrationDatabase';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';

export const metadata = AI_SUPERVIZE_MINI_METADATA;
export const dynamic = 'force-dynamic';

type AiSupervizeMiniRouteProps = {
    readonly searchParams: Promise<{
        readonly code?: string | string[];
        readonly source?: string | string[];
    }>;
};

export default async function AiSupervizeMiniRoute({ searchParams }: AiSupervizeMiniRouteProps) {
    const resolvedSearchParams = await searchParams;
    const enteredDiscountCode = readFirstSearchParameter(resolvedSearchParams.code) ?? '';
    const isOnlineWorkshopFollowUp =
        readFirstSearchParameter(resolvedSearchParams.source) === AI_SUPERVIZE_MINI_ONLINE_WORKSHOP_DISCOUNT_SOURCE;
    const initialDiscountLoad = enteredDiscountCode
        ? loadAiSupervizeMiniActiveDiscount(enteredDiscountCode)
        : isOnlineWorkshopFollowUp
        ? loadAiSupervizeMiniOnlineWorkshopFollowUpDiscount()
        : Promise.resolve({ activeDiscount: null, errorMessage: null });
    const [workshopAvailabilities, initialDiscountResult] = await Promise.all([
        loadAiSupervizeMiniWorkshopAvailability(),
        initialDiscountLoad,
    ]);

    if (initialDiscountResult.errorMessage !== null) {
        console.error('Failed to load the initial AI Supervize Mini discount:', initialDiscountResult.errorMessage);
    }

    const initialDiscountCode = enteredDiscountCode || initialDiscountResult.activeDiscount?.code || '';

    return (
        <AiSupervizeMiniPage
            initialDiscountCode={initialDiscountCode}
            initialActiveDiscount={initialDiscountResult.activeDiscount}
            workshopAvailabilities={workshopAvailabilities}
        />
    );
}
