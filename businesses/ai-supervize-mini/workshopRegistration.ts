import {
    AI_SUPERVIZE_MINI_WORKSHOP_CONFIG,
    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE,
    getAiSupervizeMiniWorkshopDateById,
    type AiSupervizeMiniWorkshopDate,
} from '@/businesses/ai-supervize-mini/config';
import type { ActiveDiscount, ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';

export type AiSupervizeMiniInvoiceType = 'company' | 'individual';

export type AiSupervizeMiniWorkshopAvailability = {
    readonly workshopDateId: string;
    readonly registeredParticipantCount: number;
    readonly remainingSeatCount: number;
};

export type AiSupervizeMiniWorkshopPrice = {
    readonly basePriceCzk: number;
    readonly discountAmountCzk: number;
    readonly finalPriceCzk: number;
};

export type AiSupervizeMiniWorkshopRegistrationRequest = {
    readonly selectedDateId: string;
    readonly participantCount: number;
    readonly fullname: string;
    readonly email: string;
    readonly company: string;
    readonly invoiceType: AiSupervizeMiniInvoiceType;
    readonly billingDetails: string;
    readonly userNote: string;
    readonly discountCode: string;
};

export type AiSupervizeMiniStoredWorkshopRegistration = {
    readonly registrationType: typeof AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE;
    readonly workshop: typeof AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.title;
    readonly selectedDateId: string;
    readonly selectedDate: string;
    readonly selectedFormat: string;
    readonly place: string;
    readonly timeRange: string;
    readonly participantCount: number;
    readonly company: string;
    readonly invoiceType: AiSupervizeMiniInvoiceType;
    readonly billingDetails: string;
    readonly userNote: string | null;
    readonly discountCodeEntered: string | null;
    readonly discountCodeUsed: string | null;
    readonly discountPercentApplied: number;
    readonly unitPriceCzk: number;
    readonly basePriceCzk: number;
    readonly discountAmountCzk: number;
    readonly computedFinalPriceCzk: number;
    readonly isVatPayer: boolean;
};

type AiSupervizeMiniSeatReservation = {
    readonly selectedDateId: string;
    readonly participantCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonObject(value: string): Record<string, unknown> | null {
    try {
        const parsedValue: unknown = JSON.parse(value);

        return isRecord(parsedValue) ? parsedValue : null;
    } catch {
        return null;
    }
}

function getRegistrationPayloadFromContactNote(contactNote: string): Record<string, unknown> | null {
    const trimmedContactNote = contactNote.trim();
    const directPayload = parseJsonObject(trimmedContactNote);

    if (directPayload !== null) {
        return directPayload;
    }

    // Older registrations have a human-readable introduction before the JSON payload.
    const lastJsonPayloadStart = contactNote.lastIndexOf('\n{');

    return lastJsonPayloadStart === -1 ? null : parseJsonObject(contactNote.slice(lastJsonPayloadStart + 1));
}

function getAiSupervizeMiniSeatReservation(contactNote: string | null): AiSupervizeMiniSeatReservation | null {
    if (contactNote === null) {
        return null;
    }

    const registrationPayload = getRegistrationPayloadFromContactNote(contactNote);

    if (registrationPayload === null) {
        return null;
    }

    const isKnownRegistration =
        registrationPayload.registrationType === AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE ||
        registrationPayload.workshop === AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.title;
    const selectedDateId = registrationPayload.selectedDateId;
    const participantCount = registrationPayload.participantCount;

    if (
        !isKnownRegistration ||
        typeof selectedDateId !== 'string' ||
        getAiSupervizeMiniWorkshopDateById(selectedDateId) === null ||
        typeof participantCount !== 'number' ||
        !Number.isSafeInteger(participantCount) ||
        participantCount < 1
    ) {
        return null;
    }

    return { selectedDateId, participantCount };
}

export function createAiSupervizeMiniWorkshopAvailability(
    contactNotes: readonly (string | null)[],
): readonly AiSupervizeMiniWorkshopAvailability[] {
    const registeredParticipantCountByDateId = new Map<string, number>();

    for (const contactNote of contactNotes) {
        const seatReservation = getAiSupervizeMiniSeatReservation(contactNote);

        if (seatReservation === null) {
            continue;
        }

        const registeredParticipantCount = registeredParticipantCountByDateId.get(seatReservation.selectedDateId) ?? 0;
        registeredParticipantCountByDateId.set(
            seatReservation.selectedDateId,
            registeredParticipantCount + seatReservation.participantCount,
        );
    }

    return AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates.map((workshopDate) => {
        const registeredParticipantCount = registeredParticipantCountByDateId.get(workshopDate.id) ?? 0;

        return {
            workshopDateId: workshopDate.id,
            registeredParticipantCount,
            remainingSeatCount: Math.max(workshopDate.maximumParticipantCount - registeredParticipantCount, 0),
        };
    });
}

export function getAiSupervizeMiniWorkshopAvailabilityByDateId(
    workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[],
    workshopDateId: string,
): AiSupervizeMiniWorkshopAvailability | null {
    return workshopAvailabilities.find((workshopAvailability) => workshopAvailability.workshopDateId === workshopDateId) ?? null;
}

/**
 * A code link opens the first term where that code is active, so a code limited to one format does
 * not initially look invalid in the other format.
 */
export function getInitialAiSupervizeMiniWorkshopDateId(
    activeDiscountByPlaceId: ActiveDiscountByPlaceId,
): string {
    const discountedWorkshopDate = AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates.find(
        (workshopDate) => (activeDiscountByPlaceId[workshopDate.discountPlaceId] ?? null) !== null,
    );

    return (discountedWorkshopDate ?? AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.workshopDates[0]!).id;
}

export function createAiSupervizeMiniWorkshopPrice(
    workshopDate: AiSupervizeMiniWorkshopDate,
    participantCount: number,
    activeDiscount: ActiveDiscount | null,
): AiSupervizeMiniWorkshopPrice {
    const basePriceCzk = workshopDate.pricePerParticipantCzk * participantCount;
    const discountAmountCzk =
        activeDiscount === null ? 0 : Math.round((basePriceCzk * activeDiscount.percent) / 100);

    return {
        basePriceCzk,
        discountAmountCzk,
        finalPriceCzk: basePriceCzk - discountAmountCzk,
    };
}

export function createAiSupervizeMiniStoredWorkshopRegistration(
    registrationRequest: AiSupervizeMiniWorkshopRegistrationRequest,
    workshopDate: AiSupervizeMiniWorkshopDate,
    activeDiscount: ActiveDiscount | null,
): AiSupervizeMiniStoredWorkshopRegistration {
    const workshopPrice = createAiSupervizeMiniWorkshopPrice(
        workshopDate,
        registrationRequest.participantCount,
        activeDiscount,
    );

    return {
        registrationType: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE,
        workshop: AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.title,
        selectedDateId: workshopDate.id,
        selectedDate: workshopDate.label,
        selectedFormat: workshopDate.formatLabel,
        place: workshopDate.placeLabel,
        timeRange: workshopDate.timeRange,
        participantCount: registrationRequest.participantCount,
        company: registrationRequest.company,
        invoiceType: registrationRequest.invoiceType,
        billingDetails: registrationRequest.billingDetails,
        userNote: registrationRequest.userNote.trim() || null,
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.percent ?? 0,
        unitPriceCzk: workshopDate.pricePerParticipantCzk,
        basePriceCzk: workshopPrice.basePriceCzk,
        discountAmountCzk: workshopPrice.discountAmountCzk,
        computedFinalPriceCzk: workshopPrice.finalPriceCzk,
        isVatPayer: AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.isVatPayer,
    };
}

export function createAiSupervizeMiniWorkshopRegistrationContactNote(
    storedRegistration: AiSupervizeMiniStoredWorkshopRegistration,
): string {
    return JSON.stringify(storedRegistration, null, 2);
}

export function createAiSupervizeMiniWorkshopAvailabilityAfterRegistration(
    workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[],
    workshopDateId: string,
    participantCount: number,
): readonly AiSupervizeMiniWorkshopAvailability[] {
    return workshopAvailabilities.map((workshopAvailability) => {
        if (workshopAvailability.workshopDateId !== workshopDateId) {
            return workshopAvailability;
        }

        const registeredParticipantCount = workshopAvailability.registeredParticipantCount + participantCount;

        return {
            ...workshopAvailability,
            registeredParticipantCount,
            remainingSeatCount: Math.max(workshopAvailability.remainingSeatCount - participantCount, 0),
        };
    });
}

export function formatCzechKoruna(amount: number): string {
    return `${amount.toLocaleString('cs-CZ')} Kč`;
}
