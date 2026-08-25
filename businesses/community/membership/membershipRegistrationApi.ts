import type { CommunityMembershipPrice } from '@/businesses/community/membership/membershipConfig';
import type { CommunityMembershipRegistrationRequest } from '@/businesses/community/membership/membershipRegistration';

const COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH = '/api/community/membership/registration';

type CommunityMembershipRegistrationResponse = {
    readonly membershipPrice: CommunityMembershipPrice;
    readonly planName: string;
    readonly trialDays: number;
};

type CommunityMembershipRegistrationErrorResponse = {
    readonly error?: unknown;
};

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
    const priceFieldNames: readonly (keyof CommunityMembershipPrice)[] = [
        'basePriceCzk',
        'annualDiscountAmountCzk',
        'priceAfterAnnualDiscountCzk',
        'discountCodePercent',
        'discountCodeAmountCzk',
        'finalPriceCzk',
    ];

    return priceFieldNames.every((fieldName) => typeof price[fieldName] === 'number');
}

/** Sends a membership application to the endpoint which recalculates every price on the server. */
export async function submitCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
): Promise<CommunityMembershipRegistrationResponse> {
    const response = await fetch(COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationRequest),
    });
    const responseBody = (await response.json().catch(() => ({}))) as CommunityMembershipRegistrationErrorResponse &
        Partial<CommunityMembershipRegistrationResponse>;

    if (!response.ok) {
        throw new CommunityMembershipRegistrationError(
            typeof responseBody.error === 'string'
                ? responseBody.error
                : `Request failed with status ${response.status}`,
        );
    }

    if (
        !isCommunityMembershipPrice(responseBody.membershipPrice) ||
        typeof responseBody.planName !== 'string' ||
        typeof responseBody.trialDays !== 'number'
    ) {
        throw new CommunityMembershipRegistrationError('Odpověď přihlášky není úplná.');
    }

    return responseBody as CommunityMembershipRegistrationResponse;
}
