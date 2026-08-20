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
};

export type AiSupervizeMiniWorkshopDiscount = {
    readonly code: string;
    readonly percent: number;
    readonly startsAt: string;
    readonly endsAt: string;
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

export const AI_SUPERVIZE_MINI_WEBINAR_DISCOUNT_CODE = 'webinar-2026-08-20';
export const AI_SUPERVIZE_MINI_WEBINAR_FOLLOW_UP_PATH =
    `/ai-supervize-mini?code=${AI_SUPERVIZE_MINI_WEBINAR_DISCOUNT_CODE}`;

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
        },
    ] as const satisfies readonly AiSupervizeMiniWorkshopDate[],
    discounts: [
        {
            code: AI_SUPERVIZE_MINI_WEBINAR_DISCOUNT_CODE,
            percent: 25,
            // The webinar discount is valid for the complete calendar day in Prague (CEST).
            startsAt: '2026-08-20T00:00:00+02:00',
            endsAt: '2026-08-20T23:59:59.999+02:00',
        },
    ] as const satisfies readonly AiSupervizeMiniWorkshopDiscount[],
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
