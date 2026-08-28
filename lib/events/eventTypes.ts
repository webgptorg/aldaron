import { ONLINE_WORKSHOP_PARTICIPANT_PATH, ONLINE_WORKSHOP_PATH } from '@/businesses/online-workshop/config';
import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';

/**
 * Every kind of event which can be administered, ordered as an administration offers them
 */
export const EVENT_TYPE_VALUES = ['online-workshop', 'ai-supervize-mini'] as const;

export type EventType = (typeof EVENT_TYPE_VALUES)[number];

export function isEventType(value: string): value is EventType {
    return EVENT_TYPE_VALUES.includes(value as EventType);
}

export type EventTypeDefinition = {
    readonly id: EventType;

    /**
     * How this kind of event is named wherever a term of it is listed
     */
    readonly label: string;

    /**
     * The public page which lists the terms of this kind of event and registers visitors for them
     */
    readonly landingPagePath: string;

    /**
     * The live room the terms of this kind of event are held in, or `null` when this kind of event has no room
     *
     * Note: A kind of event without a room is led to its landing page instead, so nothing ever offers a room which
     *       an event does not have.
     */
    readonly participantPath: string | null;
};

/**
 * Every kind of event together with what it is
 *
 * Note: This is the one place a kind of event is described. Its landing page, the administration, and every list of
 *       terms read it, so offering another kind of event means adding it here rather than changing any of them.
 */
const EVENT_TYPE_DEFINITIONS: Readonly<Record<EventType, EventTypeDefinition>> = {
    'online-workshop': {
        id: 'online-workshop',
        label: 'Online workshop',
        landingPagePath: ONLINE_WORKSHOP_PATH,
        participantPath: ONLINE_WORKSHOP_PARTICIPANT_PATH,
    },
    'ai-supervize-mini': {
        id: 'ai-supervize-mini',
        label: 'AI Supervize Mini',
        landingPagePath: AI_SUPERVIZE_MINI_PATH,
        participantPath: null,
    },
};

export function getEventTypeDefinition(eventType: EventType): EventTypeDefinition {
    return EVENT_TYPE_DEFINITIONS[eventType];
}

export const EVENT_TYPE_DEFINITION_LIST: readonly EventTypeDefinition[] = EVENT_TYPE_VALUES.map(getEventTypeDefinition);
