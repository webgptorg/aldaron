import { WORKSHOP_SESSION_MAX_AGE_SECONDS } from '@/lib/workshops/workshopConstants';
import type { WorkshopPublicState } from '@/lib/workshops/workshopTypes';

// Version the snapshot whenever its room-state shape or security boundary changes:
// an older cached state may still contain raw material destinations from before
// every public link was materialized through the shortener, predate community polls, or lack the moderated project
// gallery. A newly shaped state must never be confused with an old private browser snapshot during an outage.
const WORKSHOP_PARTICIPANT_STATE_CACHE_KEY_PREFIX = 'promptbook.workshop-participant-state.v4.';
const WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS = WORKSHOP_SESSION_MAX_AGE_SECONDS * 1_000;

type WorkshopParticipantStateCacheEntry = {
    readonly savedAt: number;
    readonly state: WorkshopPublicState;
};

function isObject(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null;
}

/**
 * Checks the few structural guarantees the room needs before it renders a browser-stored snapshot. The cache only
 * ever receives server state, but a malformed or old local value must still look like no cache rather than break the
 * room while the server is unavailable.
 */
function isWorkshopPublicStateCacheEntry(
    value: unknown,
    workshopSlug: string,
): value is WorkshopParticipantStateCacheEntry {
    if (!isObject(value) || !Number.isFinite(value.savedAt) || !isObject(value.state)) {
        return false;
    }

    const { state } = value;
    const { workshop, participant } = state;
    return (
        typeof state.serverTime === 'string' &&
        isObject(workshop) &&
        (workshop.kind === 'workshop' || workshop.kind === 'community') &&
        workshop.slug === workshopSlug &&
        typeof workshop.title === 'string' &&
        typeof workshop.description === 'string' &&
        typeof workshop.startsAt === 'string' &&
        (typeof workshop.endsAt === 'string' || workshop.endsAt === null) &&
        (typeof workshop.youtubeVideoId === 'string' || workshop.youtubeVideoId === null) &&
        Array.isArray(workshop.allowedReactions) &&
        Array.isArray(workshop.disabledPanels) &&
        isObject(participant) &&
        typeof participant.id === 'string' &&
        typeof participant.fullname === 'string' &&
        typeof participant.email === 'string' &&
        typeof participant.connectedAt === 'string' &&
        typeof participant.isInteractionBanned === 'boolean' &&
        typeof participant.isTrusted === 'boolean' &&
        typeof participant.isModerator === 'boolean' &&
        typeof state.watchingParticipantCount === 'number' &&
        Array.isArray(state.contentBlocks) &&
        Array.isArray(state.comments) &&
        Array.isArray(state.recentReactions) &&
        Array.isArray(state.reactionCounts) &&
        Array.isArray(state.polls) &&
        Array.isArray(state.projects)
    );
}

function getWorkshopParticipantStateCacheKey(workshopSlug: string): string {
    return `${WORKSHOP_PARTICIPANT_STATE_CACHE_KEY_PREFIX}${encodeURIComponent(workshopSlug)}`;
}

function getBrowserStorage(): Storage | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        // Privacy settings can disable browser storage. The live room still works normally without its fallback.
        return null;
    }
}

function removeWorkshopParticipantStateCacheEntry(storage: Storage, workshopSlug: string): void {
    try {
        storage.removeItem(getWorkshopParticipantStateCacheKey(workshopSlug));
    } catch {
        // Storage can become unavailable between reading and removing. There is no live-room failure to report.
    }
}

/**
 * Stores the newest room state independently for every workshop. The cache deliberately expires with the
 * participant session, so a long-expired browser session cannot reopen private participant data as a room snapshot.
 */
export function saveWorkshopParticipantStateCache(workshopSlug: string, state: WorkshopPublicState): void {
    const storage = getBrowserStorage();
    if (storage === null) {
        return;
    }

    try {
        storage.setItem(
            getWorkshopParticipantStateCacheKey(workshopSlug),
            JSON.stringify({ savedAt: Date.now(), state } satisfies WorkshopParticipantStateCacheEntry),
        );
    } catch {
        // A full or disabled storage area must not interrupt watching a live stream.
    }
}

/**
 * Reads a still-valid local snapshot for exactly one workshop. Invalid and expired values are discarded so the
 * participant never mistakes data from a different room or an old browser session for the current one.
 */
export function loadWorkshopParticipantStateCache(workshopSlug: string): WorkshopParticipantStateCacheEntry | null {
    const storage = getBrowserStorage();
    if (storage === null) {
        return null;
    }

    try {
        const rawCacheEntry = storage.getItem(getWorkshopParticipantStateCacheKey(workshopSlug));
        if (rawCacheEntry === null) {
            return null;
        }

        const cacheEntry: unknown = JSON.parse(rawCacheEntry);
        if (!isWorkshopPublicStateCacheEntry(cacheEntry, workshopSlug)) {
            removeWorkshopParticipantStateCacheEntry(storage, workshopSlug);
            return null;
        }

        const now = Date.now();
        const participantConnectedAtMilliseconds = Date.parse(cacheEntry.state.participant.connectedAt);
        const isCacheEntryUsable =
            cacheEntry.savedAt <= now &&
            now - cacheEntry.savedAt <= WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS &&
            Number.isFinite(participantConnectedAtMilliseconds) &&
            participantConnectedAtMilliseconds <= now &&
            now - participantConnectedAtMilliseconds <= WORKSHOP_PARTICIPANT_STATE_CACHE_MAX_AGE_MILLISECONDS;
        if (!isCacheEntryUsable) {
            removeWorkshopParticipantStateCacheEntry(storage, workshopSlug);
            return null;
        }

        return cacheEntry;
    } catch {
        removeWorkshopParticipantStateCacheEntry(storage, workshopSlug);
        return null;
    }
}

/**
 * An authoritative 401 or 404 means this browser must connect again or the room no longer exists, so its private
 * local copy is no longer a safe fallback.
 */
export function clearWorkshopParticipantStateCache(workshopSlug: string): void {
    const storage = getBrowserStorage();
    if (storage !== null) {
        removeWorkshopParticipantStateCacheEntry(storage, workshopSlug);
    }
}
