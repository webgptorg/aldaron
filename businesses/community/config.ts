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
 * The persistent room which the community migration creates and protects from being renamed.
 */
export const COMMUNITY_WORKSHOP_SLUG = 'komunita';

/**
 * Community project routes stay below the community workshop API path, which is also where the narrowly scoped
 * community session cookie is sent.
 */
export const COMMUNITY_PROJECTS_API_PATH = `/api/workshops/${COMMUNITY_WORKSHOP_SLUG}/projects`;

/**
 * Internal dashboard for the one community room.
 */
export const COMMUNITY_ADMIN_PATH = '/admin/community';

export function createCommunityProjectPath(projectId: string): string {
    return `${COMMUNITY_PROJECTS_PATH}/${encodeURIComponent(projectId)}`;
}
