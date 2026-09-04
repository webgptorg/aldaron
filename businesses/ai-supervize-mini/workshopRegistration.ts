import {
    AI_SUPERVIZE_MINI_WORKSHOP_CONFIG,
    AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE,
    getAiSupervizeMiniDiscountPlaceId,
} from '@/businesses/ai-supervize-mini/config';
import type { ActiveDiscount, ActiveDiscountByPlaceId } from '@/lib/discounts/discountCode';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import { formatEventFormat } from '@/lib/events/eventLocation';
import { formatCzechCountedNoun } from '@/lib/language/czechNumbers';
import {
    formatCzechWorkshopDay,
    formatCzechWorkshopTimeRange,
    formatPragueCalendarDate,
} from '@/lib/workshops/workshopDate';

export type AiSupervizeMiniInvoiceType = 'company' | 'individual';

export type AiSupervizeMiniWorkshopAvailability = {
    readonly eventSlug: string;
    readonly registeredParticipantCount: number;

    /**
     * How many seats are still free, or `null` when the term takes everybody who registers for it
     */
    readonly remainingSeatCount: number | null;
};

/**
 * The capacity result for one submitted registration. A full workshop accepts
 * the submission as a waitlist entry, while a group which does not fit into a
 * partly filled workshop still needs a smaller participant count.
 */
export type AiSupervizeMiniWorkshopRegistrationState =
    | 'unavailable'
    | 'does-not-fit'
    | 'confirmed'
    | 'waitlisted';

export type AiSupervizeMiniAcceptedWorkshopRegistrationState = Extract<
    AiSupervizeMiniWorkshopRegistrationState,
    'confirmed' | 'waitlisted'
>;

/**
 * Fields read from a Contact row when calculating a workshop's confirmed
 * capacity. Waitlisted registrations deliberately do not reserve a seat.
 */
export type AiSupervizeMiniWorkshopRegistrationContact = {
    readonly userNote: string | null;
    readonly isWaitlisted: boolean | null;
};

export type AiSupervizeMiniWorkshopPrice = {
    readonly basePriceCzk: number;
    readonly discountAmountCzk: number;
    readonly finalPriceCzk: number;
};

export type AiSupervizeMiniWorkshopRegistrationRequest = {
    readonly eventSlug: string;
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

    /**
     * The term this registration reserves seats in
     *
     * Note: The field keeps the name every stored registration was written with, so a registration written before the
     *       terms were administered from one place is still counted against the very term it was made for.
     */
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
        typeof participantCount !== 'number' ||
        !Number.isSafeInteger(participantCount) ||
        participantCount < 1
    ) {
        return null;
    }

    return { selectedDateId, participantCount };
}

/**
 * Every identifier one term has ever been registered for under
 *
 * Note: Registrations written before the terms were administered from one place name their term by the day it is held
 *       on, so those seats keep being counted against that very term.
 */
function getAiSupervizeMiniEventRegistrationIds(event: EventOccurrence): readonly string[] {
    return [event.slug, formatPragueCalendarDate(event.startsAt)];
}

export function getAiSupervizeMiniEventBySlug(
    events: readonly EventOccurrence[],
    eventSlug: string,
): EventOccurrence | null {
    return events.find((event) => event.slug === eventSlug) ?? null;
}

function getRemainingSeatCount(event: EventOccurrence, registeredParticipantCount: number): number | null {
    const maximumParticipantCount = event.event.maximumParticipantCount;

    return maximumParticipantCount === null
        ? null
        : Math.max(maximumParticipantCount - registeredParticipantCount, 0);
}

export function createAiSupervizeMiniWorkshopAvailability(
    events: readonly EventOccurrence[],
    contactNotes: readonly (string | null)[],
): readonly AiSupervizeMiniWorkshopAvailability[] {
    const registeredParticipantCountByRegistrationId = new Map<string, number>();

    for (const contactNote of contactNotes) {
        const seatReservation = getAiSupervizeMiniSeatReservation(contactNote);

        if (seatReservation === null) {
            continue;
        }

        const registeredParticipantCount =
            registeredParticipantCountByRegistrationId.get(seatReservation.selectedDateId) ?? 0;
        registeredParticipantCountByRegistrationId.set(
            seatReservation.selectedDateId,
            registeredParticipantCount + seatReservation.participantCount,
        );
    }

    return events.map((event) => {
        const registeredParticipantCount = getAiSupervizeMiniEventRegistrationIds(event).reduce(
            (participantCount, registrationId) =>
                participantCount + (registeredParticipantCountByRegistrationId.get(registrationId) ?? 0),
            0,
        );

        return {
            eventSlug: event.slug,
            registeredParticipantCount,
            remainingSeatCount: getRemainingSeatCount(event, registeredParticipantCount),
        };
    });
}

/**
 * Turn Contact rows into the confirmed capacity of each term. The contact
 * flag is the single source of truth for whether a registration is waitlisted.
 */
export function createAiSupervizeMiniWorkshopAvailabilityFromRegistrationContacts(
    events: readonly EventOccurrence[],
    registrationContacts: readonly AiSupervizeMiniWorkshopRegistrationContact[],
): readonly AiSupervizeMiniWorkshopAvailability[] {
    return createAiSupervizeMiniWorkshopAvailability(
        events,
        registrationContacts
            .filter((registrationContact) => registrationContact.isWaitlisted !== true)
            .map((registrationContact) => registrationContact.userNote),
    );
}

export function getAiSupervizeMiniWorkshopAvailabilityByEventSlug(
    workshopAvailabilities: readonly AiSupervizeMiniWorkshopAvailability[],
    eventSlug: string,
): AiSupervizeMiniWorkshopAvailability | null {
    return workshopAvailabilities.find((workshopAvailability) => workshopAvailability.eventSlug === eventSlug) ?? null;
}

/**
 * Decide whether the current registration confirms seats, joins the waitlist,
 * or needs the visitor to adjust their group size. Both the public form and
 * the server use this rule so an outdated browser cannot change the outcome.
 */
export function getAiSupervizeMiniWorkshopRegistrationState(
    workshopAvailability: AiSupervizeMiniWorkshopAvailability | null,
    participantCount: number,
): AiSupervizeMiniWorkshopRegistrationState {
    if (workshopAvailability === null) {
        return 'unavailable';
    }

    if (!Number.isSafeInteger(participantCount) || participantCount < 1) {
        return 'does-not-fit';
    }

    if (workshopAvailability.remainingSeatCount === null) {
        return 'confirmed';
    }

    if (workshopAvailability.remainingSeatCount === 0) {
        return 'waitlisted';
    }

    return participantCount <= workshopAvailability.remainingSeatCount ? 'confirmed' : 'does-not-fit';
}

export function isAiSupervizeMiniWorkshopFull(
    workshopAvailability: AiSupervizeMiniWorkshopAvailability | null,
): boolean {
    return workshopAvailability?.remainingSeatCount === 0;
}

/**
 * How many seats are free, in the case Czech counts them with, so one free seat never reads `1 volných míst`
 *
 * Note: A full term is announced by {@link isAiSupervizeMiniWorkshopFull} instead, so no caller counts zero seats here.
 */
export function formatCzechFreeSeatCount(freeSeatCount: number): string {
    return formatCzechCountedNoun(freeSeatCount, ['volné místo', 'volná místa', 'volných míst']);
}

/**
 * A code link opens the first term where that code is active, so a code limited to one format does
 * not initially look invalid in the other format.
 */
export function getInitialAiSupervizeMiniEventSlug(
    events: readonly EventOccurrence[],
    activeDiscountByPlaceId: ActiveDiscountByPlaceId,
): string | null {
    const discountedEvent = events.find(
        (event) =>
            (activeDiscountByPlaceId[getAiSupervizeMiniDiscountPlaceId(event.event.locationKind)] ?? null) !== null,
    );

    return (discountedEvent ?? events[0])?.slug ?? null;
}

export function createAiSupervizeMiniWorkshopPrice(
    event: EventOccurrence,
    participantCount: number,
    activeDiscount: ActiveDiscount | null,
): AiSupervizeMiniWorkshopPrice {
    const basePriceCzk = event.event.priceCzk * participantCount;
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
    event: EventOccurrence,
    activeDiscount: ActiveDiscount | null,
): AiSupervizeMiniStoredWorkshopRegistration {
    const workshopPrice = createAiSupervizeMiniWorkshopPrice(
        event,
        registrationRequest.participantCount,
        activeDiscount,
    );

    return {
        registrationType: AI_SUPERVIZE_MINI_WORKSHOP_REGISTRATION_TYPE,
        workshop: AI_SUPERVIZE_MINI_WORKSHOP_CONFIG.title,
        selectedDateId: event.slug,
        selectedDate: formatCzechWorkshopDay(event.startsAt),
        selectedFormat: formatEventFormat(event.event),
        place: event.event.locationLabel,
        timeRange: formatCzechWorkshopTimeRange(event.startsAt, event.endsAt),
        participantCount: registrationRequest.participantCount,
        company: registrationRequest.company,
        invoiceType: registrationRequest.invoiceType,
        billingDetails: registrationRequest.billingDetails,
        userNote: registrationRequest.userNote.trim() || null,
        discountCodeEntered: registrationRequest.discountCode.trim() || null,
        discountCodeUsed: activeDiscount?.code ?? null,
        discountPercentApplied: activeDiscount?.percent ?? 0,
        unitPriceCzk: event.event.priceCzk,
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
    eventSlug: string,
    participantCount: number,
    registrationState: AiSupervizeMiniAcceptedWorkshopRegistrationState,
): readonly AiSupervizeMiniWorkshopAvailability[] {
    if (registrationState === 'waitlisted') {
        return workshopAvailabilities;
    }

    return workshopAvailabilities.map((workshopAvailability) => {
        if (workshopAvailability.eventSlug !== eventSlug) {
            return workshopAvailability;
        }

        const registeredParticipantCount = workshopAvailability.registeredParticipantCount + participantCount;

        return {
            ...workshopAvailability,
            registeredParticipantCount,
            remainingSeatCount:
                workshopAvailability.remainingSeatCount === null
                    ? null
                    : Math.max(workshopAvailability.remainingSeatCount - participantCount, 0),
        };
    });
}
