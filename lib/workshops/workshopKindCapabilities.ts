import type { WorkshopKind } from '@/lib/workshops/workshopTypes';

/**
 * What a room of one kind is, so that a screen asks for the capability it needs instead of naming the kind itself
 */
export type WorkshopKindCapabilities = {
    /**
     * Whether exactly one room of this kind exists, so nothing offers a choice between rooms or the creation of another
     */
    readonly isSingleton: boolean;

    /**
     * Whether the URL of a room stays as it is, so an ordinary settings edit cannot disconnect the links leading to it
     */
    readonly isSlugFixed: boolean;

    /**
     * Whether a room happens at a time, so it has a start, an end, and a countdown towards it
     */
    readonly isScheduled: boolean;

    /**
     * Whether a room gathers its participants around a shared stage with a video stream
     */
    readonly isStageOffered: boolean;

    /**
     * Whether a room updates itself while it is open, which its broadcast, its reactions, and its watching count need
     */
    readonly isRealtime: boolean;
};

/**
 * Every room kind together with what it is
 *
 * Note: A workshop occurrence is the live event this infrastructure was built for. The community reuses the very same
 *       secured room, but is one permanent, calm space rather than an occurrence which starts, streams, and ends.
 * Note: This is the one place a room kind is described. Every screen reads it, so a kind added later needs no change
 *       of the room, of its administration, or of the routes behind them.
 */
const WORKSHOP_KIND_CAPABILITY_DEFINITIONS: Readonly<Record<WorkshopKind, WorkshopKindCapabilities>> = {
    workshop: {
        isSingleton: false,
        isSlugFixed: false,
        isScheduled: true,
        isStageOffered: true,
        isRealtime: true,
    },
    community: {
        isSingleton: true,
        isSlugFixed: true,
        isScheduled: false,
        isStageOffered: false,
        isRealtime: false,
    },
};

export function getWorkshopKindCapabilities(workshopKind: WorkshopKind): WorkshopKindCapabilities {
    return WORKSHOP_KIND_CAPABILITY_DEFINITIONS[workshopKind];
}

/**
 * The settings of a room which its kind does not have at all
 */
const WORKSHOP_SCHEDULE_FIELD_NAMES = ['startsAt', 'endsAt'] as const;
const WORKSHOP_STAGE_FIELD_NAMES = ['youtubeVideoId'] as const;

/**
 * The written settings which the kind of a room does not have
 *
 * Note: The administration already leaves these settings out of its form, so this only refuses a stale or a forged
 *       request which would give a calm room a schedule or a stage that nothing in it could ever show.
 */
export function getUnsupportedWorkshopKindFieldNames(
    workshopKind: WorkshopKind,
    values: Readonly<Record<string, unknown>>,
): readonly string[] {
    const capabilities = getWorkshopKindCapabilities(workshopKind);
    const unsupportedFieldNames = [
        ...(capabilities.isScheduled ? [] : WORKSHOP_SCHEDULE_FIELD_NAMES),
        ...(capabilities.isStageOffered ? [] : WORKSHOP_STAGE_FIELD_NAMES),
    ];

    return unsupportedFieldNames.filter((fieldName) => values[fieldName] !== undefined);
}
