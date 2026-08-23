import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';
import { AI_SUPERVIZE_MINI_PATH, createDiscountCodePrefillPath } from '@/lib/discounts/discountPlaces';
import { permanentRedirect } from 'next/navigation';

type SkoleniRouteProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

export default async function SkoleniRoute({ searchParams }: SkoleniRouteProps) {
    const resolvedSearchParams = await searchParams;
    const discountCode = readFirstSearchParameter(resolvedSearchParams[DISCOUNT_CODE_QUERY_PARAMETER]);

    permanentRedirect(
        discountCode === null
            ? AI_SUPERVIZE_MINI_PATH
            : createDiscountCodePrefillPath(AI_SUPERVIZE_MINI_PATH, REGISTRATION_SECTION_ID, discountCode),
    );
}
