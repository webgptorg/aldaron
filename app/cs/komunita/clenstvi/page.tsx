import { COMMUNITY_MEMBERSHIP_PAID_PLANS } from '@/businesses/community/membership/membershipConfig';
import { CommunityMembershipPage } from '@/businesses/community/membership/CommunityMembershipPage';
import { COMMUNITY_MEMBERSHIP_METADATA } from '@/businesses/community/membership/communityMembershipMetadata';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import { DISCOUNT_CODE_QUERY_PARAMETER } from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscountsByPlace } from '@/lib/discounts/discountCodeDatabase';

export const metadata = COMMUNITY_MEMBERSHIP_METADATA;
export const dynamic = 'force-dynamic';

type CommunityMembershipRouteProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

/** The premium-membership landing page shares its discount-code prefill convention with every paid offer. */
export default async function CommunityMembershipRoute({ searchParams }: CommunityMembershipRouteProps) {
    const resolvedSearchParams = await searchParams;
    const initialDiscountCode = readFirstSearchParameter(resolvedSearchParams[DISCOUNT_CODE_QUERY_PARAMETER]) ?? '';
    const discountPlaceIds = COMMUNITY_MEMBERSHIP_PAID_PLANS.map((plan) => plan.discountPlaceId);
    const initialDiscountResult = await loadActiveDiscountsByPlace(initialDiscountCode, discountPlaceIds);

    if (initialDiscountResult.errorMessage !== null) {
        console.error('Failed to load the initial community membership discount:', initialDiscountResult.errorMessage);
    }

    return (
        <CommunityMembershipPage
            initialDiscountCode={initialDiscountCode}
            initialActiveDiscountByPlaceId={initialDiscountResult.activeDiscountByPlaceId}
        />
    );
}
