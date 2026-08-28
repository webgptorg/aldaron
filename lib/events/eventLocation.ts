/**
 * Whether a term is held somewhere or online, which is the one choice every event makes about its place
 */
export const EVENT_LOCATION_KIND_VALUES = ['online', 'onsite'] as const;

export type EventLocationKind = (typeof EVENT_LOCATION_KIND_VALUES)[number];

export function isEventLocationKind(value: string): value is EventLocationKind {
    return EVENT_LOCATION_KIND_VALUES.includes(value as EventLocationKind);
}

export const EVENT_LOCATION_KIND_LABELS: Readonly<Record<EventLocationKind, string>> = {
    online: 'Online',
    onsite: 'Prezenčně',
};

/**
 * Where one term is held, as a visitor reads it
 *
 * Note: An online term has nowhere to be, so it is named by its form. A term held somewhere is named by that place,
 *       because the place is what a visitor needs to travel to.
 */
export function formatEventLocation(event: {
    readonly locationKind: EventLocationKind;
    readonly locationLabel: string;
}): string {
    if (event.locationKind === 'online') {
        return EVENT_LOCATION_KIND_LABELS.online;
    }

    return event.locationLabel.trim() || EVENT_LOCATION_KIND_LABELS.onsite;
}

/**
 * The form of one term together with its place, for example `Prezenčně · Praha`
 *
 * Note: The place of a term is written by an administrator, so it is never declined into a sentence. It is named
 *       beside the form of the term instead, which reads correctly whatever place is written there.
 */
export function formatEventFormat(event: {
    readonly locationKind: EventLocationKind;
    readonly locationLabel: string;
}): string {
    const locationLabel = event.locationLabel.trim();
    if (event.locationKind === 'online' || locationLabel === '') {
        return EVENT_LOCATION_KIND_LABELS[event.locationKind];
    }

    return `${EVENT_LOCATION_KIND_LABELS.onsite} · ${locationLabel}`;
}
