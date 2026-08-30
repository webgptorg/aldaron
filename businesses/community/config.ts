/**
 * Czech community entry point. Future localized routes can reuse the room component while supplying their own path
 * and copy, without changing the stable community room in the database.
 */
export const COMMUNITY_PATH = '/cs/komunita';

/**
 * The public index of creations shared by community members.
 */
export const COMMUNITY_PROJECTS_PATH = `${COMMUNITY_PATH}/projects`;

/**
 * The published calendar of every term the community lists, which a calendar application subscribes to.
 */
export const COMMUNITY_CALENDAR_PATH = `${COMMUNITY_PATH}/calendar.ics`;

/**
 * How a calendar application names this subscription among the calendars of its owner.
 */
export const COMMUNITY_CALENDAR_NAME = 'Termíny akcí Promptbooku';

/**
 * Name of the calendar file itself, which is what a browser downloading it saves.
 */
export const COMMUNITY_CALENDAR_FILE_NAME = 'promptbook-terminy-akci.ics';

/**
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = 'komunita';

/**
 * Community project routes stay below the community workshop API path, which is also where the narrowly scoped
 * community session cookie is sent.
 */
export const COMMUNITY_PROJECTS_API_PATH = `/api/workshops/${COMMUNITY_WORKSHOP_SLUG}/projects`;

/**
 * The membership of the connected member, bought and read inside the community room itself and therefore under the
 * very same narrowly scoped community session as everything else the room asks about.
 */
export const COMMUNITY_MEMBERSHIP_API_PATH = `/api/workshops/${COMMUNITY_WORKSHOP_SLUG}/membership`;
export const COMMUNITY_MEMBERSHIP_CHECKOUT_API_PATH = `${COMMUNITY_MEMBERSHIP_API_PATH}/checkout`;
export const COMMUNITY_MEMBERSHIP_CHECKOUT_CONFIRMATION_API_PATH = `${COMMUNITY_MEMBERSHIP_CHECKOUT_API_PATH}/confirmation`;

/**
 * How the payment gate returns a member to the room, which the room reads to celebrate or to say nothing happened.
 *
 * Note: A returning browser carries the id of the finished checkout, which is what lets the room confirm a payment
 *       against the gate itself rather than believing an address which anybody could type.
 */
/**
 * Where the membership is offered inside the room, which is what the badge of the header leads to.
 */
export const COMMUNITY_MEMBERSHIP_SECTION_ID = 'community-membership';

export const COMMUNITY_MEMBERSHIP_RESULT_PARAMETER_NAME = 'membership';
export const COMMUNITY_MEMBERSHIP_CHECKOUT_SESSION_PARAMETER_NAME = 'checkoutSession';
export const COMMUNITY_MEMBERSHIP_PAID_RESULT = 'paid';
export const COMMUNITY_MEMBERSHIP_CANCELLED_RESULT = 'cancelled';

/**
 * Internal dashboard for the one community room.
 */
export const COMMUNITY_ADMIN_PATH = '/admin/community';

export function createCommunityProjectPath(projectId: string): string {
    return `${COMMUNITY_PROJECTS_PATH}/${encodeURIComponent(projectId)}`;
}
