/**
 * Czech community entry point. Future localized routes can reuse the room component while supplying their own path
 * and copy, without changing the stable community room in the database.
 */
export const COMMUNITY_PATH = '/cs/komunita';

/**
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = 'komunita';

/**
 * Internal dashboard for the one community room.
 */
export const COMMUNITY_ADMIN_PATH = '/admin/community';
