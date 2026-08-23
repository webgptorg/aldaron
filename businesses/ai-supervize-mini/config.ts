import {
    AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
    AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
} from '@/lib/discounts/discountPlaces';

export type AiSupervizeMiniWorkshopFormat = 'onsite' | 'online';

export type AiSupervizeMiniWorkshopDate = {
    readonly id: string;
    readonly label: string;
    readonly format: AiSupervizeMiniWorkshopFormat;
    readonly formatLabel: string;
    readonly placeLabel: string;
    readonly timeRange: string;
    readonly pricePerParticipantCzk: number;
    readonly maximumParticipantCount: number;
    /** The shared discount place which prices this offer. */
    readonly discountPlaceId: string;
};

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
    workshopDates: [
        {
            id: '2026-09-04',
            label: '4. 9. 2026',
            format: 'onsite',
            formatLabel: 'Prezenčně v Praze',
            placeLabel: 'Praha',
            timeRange: '10:00–16:00',
            pricePerParticipantCzk: 12000,
            maximumParticipantCount: 10,
            discountPlaceId: AI_SUPERVIZE_MINI_ONSITE_DISCOUNT_PLACE_ID,
        },
        {
            id: '2026-09-09',
            label: '9. 9. 2026',
            format: 'online',
            formatLabel: 'Online workshop',
            placeLabel: 'Online',
            timeRange: '13:00–17:00',
            pricePerParticipantCzk: 3000,
            maximumParticipantCount: 50,
            discountPlaceId: AI_SUPERVIZE_MINI_ONLINE_DISCOUNT_PLACE_ID,
        },
    ] as const satisfies readonly AiSupervizeMiniWorkshopDate[],
} as const;

export function getAiSupervizeMiniWorkshopDateById(workshopDateId: string): AiSupervizeMiniWorkshopDate | null {
    return AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates.find((workshopDate) => workshopDate.id === workshopDateId) ?? null;
}

export function getAiSupervizeMiniWorkshopDateByFormat(
    workshopFormat: AiSupervizeMiniWorkshopFormat,
): AiSupervizeMiniWorkshopDate | null {
    return (
        AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates.find(
            (workshopDate) => workshopDate.format === workshopFormat,
        ) ?? null
    );
}
