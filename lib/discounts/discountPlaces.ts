import { DISCOUNT_CODE_QUERY_PARAMETER, REGISTRATION_SECTION_ID } from '@/lib/discounts/discountCodeConstants';

/**
 * One place is one offer of the application which a visitor can pay for, and therefore the one
 * thing a discount code can be valid in. This list is what the administration offers to choose
 * from, what a registration form asks about and what a `?code=` link leads to, so adding a place
 * to the application is one entry here and one `discountPlaceId` on the offer itself.
 */
export type DiscountPlace = {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly pagePath: string;
    readonly registrationSectionId: string;
};

export const AI_SUPERVIZE_MINI_PATH = '/ai-supervize-mini';

export const AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-onsite';
export const AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID = 'ai-supervize-mini-online';

export const DISCOUNT_PLACES: readonly DiscountPlace[] = [
    {
        id: AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
        label: 'AI Supervize Mini – prezenčně',
        description: 'Celodenní workshop v Praze',
        pagePath: AI_SUPERVIZE_MINI_PATH,
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
    {
        id: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
        label: 'AI Supervize Mini – online',
        description: 'Odpolední online varianta workshopu',
        pagePath: AI_SUPERVIZE_MINI_PATH,
        registrationSectionId: REGISTRATION_SECTION_ID,
    },
];

export function getDiscountPlaceById(discountPlaceId: string): DiscountPlace | null {
    return DISCOUNT_PLACES.find((discountPlace) => discountPlace.id === discountPlaceId) ?? null;
}

/**
 * Names a place for an administrator. A place which an older code still names but the application
 * no longer offers is shown as it is stored instead of disappearing from the code silently.
 */
export function getDiscountPlaceLabel(discountPlaceId: string): string {
    return getDiscountPlaceById(discountPlaceId)?.label ?? discountPlaceId;
}

export function isKnownDiscountPlaceId(discountPlaceId: string): boolean {
    return getDiscountPlaceById(discountPlaceId) !== null;
}

/**
 * The places one stored code really reaches, which is every place of the application when the code
 * names none. Both the administration and the links it offers read the same answer.
 */
export function getDiscountCodePlaces(placeIds: readonly string[]): readonly DiscountPlace[] {
    return placeIds.length === 0
        ? DISCOUNT_PLACES
        : placeIds
              .map(getDiscountPlaceById)
              .filter((discountPlace): discountPlace is DiscountPlace => discountPlace !== null);
}

/**
 * The link which prefills a code in the registration form of a place and scrolls the visitor to it
 */
export function createDiscountCodeUrl(discountPlace: DiscountPlace, discountCode: string): string {
    const discountCodeQuery = `${DISCOUNT_CODE_QUERY_PARAMETER}=${encodeURIComponent(discountCode)}`;

    return `${discountPlace.pagePath}?${discountCodeQuery}#${discountPlace.registrationSectionId}`;
}
