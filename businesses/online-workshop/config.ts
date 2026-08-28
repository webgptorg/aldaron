import type { EventType } from '@/lib/events/eventTypes';

/**
 * Site-relative path of the online workshop landing page
 */
export const ONLINE_WORKSHOP_PATH = '/cs/online-workshop';

/**
 * The kind of event whose terms this landing page lists and registers visitors for
 *
 * Note: The event registry reads the paths of this configuration, so the kind of event is only named here as a type
 *       and never imported back as a value, which keeps the two modules free of a cycle.
 */
export const ONLINE_WORKSHOP_EVENT_TYPE: EventType = 'online-workshop';

/**
 * Site-relative path of the page confirming a finished registration
 *
 * Note: The registration form navigates here with a full page load on purpose. Only a real page load runs the Meta
 *       Pixel snippet again, which fires a fresh `PageView` for this very url - a client side route change would not,
 *       so a conversion defined by this url would never be reported.
 */
export const ONLINE_WORKSHOP_THANK_YOU_PATH = `${ONLINE_WORKSHOP_PATH}/dekujeme`;

/**
 * Participant room opened from the reminder e-mail.
 */
export const ONLINE_WORKSHOP_PARTICIPANT_PATH = `${ONLINE_WORKSHOP_PATH}/participant`;

/**
 * The person who leads the recurring online workshops.
 */
export const ONLINE_WORKSHOP_HOST_FULLNAME = 'Pavol Hejný';

/**
 * Stable contact source shared by every term, so existing contact filters and exports keep grouping registrations
 * together. The selected workshop is recorded separately in the registration note.
 */
export const ONLINE_WORKSHOP_REGISTRATION_PLACE_NAME = 'OnlineWorkshopRegistration';
