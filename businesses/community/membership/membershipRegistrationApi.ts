import type {
    CommunityMembershipBillingCycle,
    CommunityMembershipPaidPlanId,
    CommunityMembershipPrice,
} from '@/businesses/community/membership/membershipConfig';
import type { CommunityMembershipRegistrationRequest } from '@/businesses/community/membership/membershipRegistration';
import { sendJson } from '@/lib/api/requestJson';

export const COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH = '/api/community/membership/registration';

export type CommunityMembershipRegistrationResponse = {
    readonly membershipPrice: CommunityMembershipPrice;
    readonly planId: CommunityMembershipPaidPlanId;
    readonly planName: string;
    readonly billingCycle: CommunityMembershipBillingCycle;
    readonly trialDays: number;
};

type CommunityMembershipRegistrationErrorResponse = { readonly error?: unknown };

export class CommunityMembershipRegistrationError extends Error {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CommunityMembershipRegistrationError.prototype);
    }
}

function isCommunityMembershipPrice(value: unknown): value is CommunityMembershipPrice {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const price = value as Record<string, unknown>;
    const fields: readonly (keyof CommunityMembershipPrice)[] = [
        'basePriceCzk',
        'annualDiscountAmountCzk',
        'priceAfterAnnualDiscountCzk',
        'discountCodePercent',
        'discountCodeAmountCzk',
        'finalPriceCzk',
    ];

    return fields.every((field) => typeof price[field] === 'number');
}

/** Sends an application to the endpoint which independently verifies the plan, code and quote. */
export async function submitCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
): Promise<CommunityMembershipRegistrationResponse> {
    const responseBody = await sendJson<
        CommunityMembershipRegistrationErrorResponse & Partial<CommunityMembershipRegistrationResponse>
    >(COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH, 'POST', registrationRequest).catch((error: unknown) => {
        throw new CommunityMembershipRegistrationError(
            error instanceof Error ? error.message : 'Přihlášku se nepodařilo odeslat.',
        );
    });

    if (
        !isCommunityMembershipPrice(responseBody.membershipPrice) ||
        (responseBody.planId !== 'standard' && responseBody.planId !== 'premium') ||
        typeof responseBody.planName !== 'string' ||
        (responseBody.billingCycle !== 'monthly' && responseBody.billingCycle !== 'yearly') ||
        typeof responseBody.trialDays !== 'number'
    ) {
        throw new CommunityMembershipRegistrationError('Odpověď přihlášky není úplná.');
    }

    return responseBody as CommunityMembershipRegistrationResponse;
}
