import type { EventLocationKind } from '@/lib/events/eventLocation';
import type { EventType } from '@/lib/events/eventTypes';
import {
    AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
    AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
} from '@/lib/discounts/discountPlaces';

/**
 * The kind of event whose terms this landing page lists and registers visitors for
 *
 * Note: The terms themselves are administered together with every other event and stored in the very same table, so
 *       nothing about them is written here anymore.
 */
export const AI_SUPERVIZE_MINI_EVENT_TYPE: EventType = 'ai-supervize-mini';

/**
 * The discriminator makes a workshop registration distinguishable from other
 * contacts gathered by the same landing page.
 */
export const AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE = 'AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION';

/**
 * Existing workshop registrations already use this origin, so keeping it
 * lets the availability calculation include compatible earlier contacts too.
 */
export const AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_PLACE_NAME = 'AiSupervizeMiniWorkshopRegistration';

export const AI_SUPERVIZE_MINI_WORKSHOP_INTEREST_PLACE_NAME = 'AiSupervizeMiniWorkshopInterest';

export const AI_SUPERVIZE_MINI_WORKSHOP_CONFIG = {
    title: 'AI Supervize Mini',
    isVatPayer: false,
} as const;

/**
 * The shared discount place which prices one term
 *
 * Note: A code is limited to the prezenční or the online form of the workshop rather than to one date, so a term
 *       added later is priced by the very same codes as the terms already published in that form.
 */
export function getAiSupervizeMiniDiscountPlaceId(locationKind: EventLocationKind): string {
    return locationKind === 'onsite'
        ? AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID
        : AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID;
}

/**
 * Every discount place the terms of this workshop can be priced by
 */
export const AI_SUPERVIZE_MINI_DISCOUNT_PLACE_IDS: readonly string[] = [
    AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
    AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
];
