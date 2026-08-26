import { COMMUNITY_MEMBERSHIP_PAID_PLANS } from '@/businesses/community/membership/membershipConfig';
import { CommunityMembershipPage } from '@/businesses/community/membership/CommunityMembershipPage';
import {
    COMMUNITY_MEMBERSHIP_METADATA,
    COMMUNITY_MEMBERSHIP_PAGE_DEFINITION,
} from '@/businesses/community/membership/communityMembershipMetadata';
import { StructuredData } from '@/components/structured-data';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';
import type { ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import {
    DISCOUNT_CODE_QUERY_PARAMETER,
    MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH,
} from '@/lib/discounts/discountCodeConstants';
import { loadActiveDiscountsByPlace } from '@/lib/discounts/discountCodeDatabase';
import { createWebPageStructuredData } from '@/lib/metadata/structured-data';
import { readWorkshopParticipantIdentity } from '@/lib/workshops/workshopParticipantLink';

export const metadata = COMMUNITY_MEMBERSHIP_METADATA;
export const dynamic = 'force-dynamic';

type CommunityMembershipRouteProps = {
    readonly searchParams: Promise<Readonly<Record<string, SearchParameterValue>>>;
};

/** Loads private discount data on the server while passing only the code's public result to the browser. */
export default async function CommunityMembershipRoute({ searchParams }: CommunityMembershipRouteProps) {
    const resolvedSearchParams = await searchParams;
    const participantIdentity = readWorkshopParticipantIdentity(
        resolvedSearchParams.email,
        resolvedSearchParams.fullname,
    );
    const initialDiscountCode = (
        readFirstSearchParameter(resolvedSearchParams[DISCOUNT_CODE_QUERY_PARAMETER]) ?? ''
    ).slice(0, MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH);
    const discountPlaceIds = COMMUNITY_MEMBERSHIP_PAID_PLANS.map((plan) => plan.discountPlaceId);
    const initialDiscountResult = initialDiscountCode
        ? await loadActiveDiscountsByPlace(initialDiscountCode, discountPlaceIds)
        : {
              activeDiscountByPlaceId: Object.fromEntries(
                  discountPlaceIds.map((discountPlaceId) => [discountPlaceId, null]),
              ) as ActiveDiscountByPlaceId,
              errorMessage: null,
          };

    if (initialDiscountResult.errorMessage !== null) {
        console.error('Failed to load the initial community membership discount:', initialDiscountResult.errorMessage);
    }

    return (
        <>
            <StructuredData nodes={[createWebPageStructuredData(COMMUNITY_MEMBERSHIP_PAGE_DEFINITION)]} />
            <CommunityMembershipPage
                initialFullname={participantIdentity.fullname}
                initialEmail={participantIdentity.email}
                initialDiscountCode={initialDiscountCode}
                initialActiveDiscountByPlaceId={initialDiscountResult.activeDiscountByPlaceId}
            />
        </>
    );
}
