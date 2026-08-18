export const WORKSHOP_TABLE_NAME = 'workshops';
export const WORKSHOP_CONTENT_TABLE_NAME = 'workshop_content_blocks';
export const WORKSHOP_PARTICIPANT_TABLE_NAME = 'workshop_participants';
export const WORKSHOP_COMMENT_TABLE_NAME = 'workshop_comments';
export const WORKSHOP_UPVOTE_TABLE_NAME = 'workshop_comment_upvotes';
export const WORKSHOP_REACTION_TABLE_NAME = 'workshop_reactions';

export const WORKSHOP_SESSION_COOKIE_PREFIX = 'workshop_session_';
export const WORKSHOP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const WORKSHOP_SESSION_TOKEN_BYTES = 32;
export const MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH = 200;
export const MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH = 320;
export const MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH = 2_000;
export const MAXIMAL_WORKSHOP_REACTION_LENGTH = 16;
export const MAXIMAL_WORKSHOP_COMMENT_LENGTH = 2_000;

export const MAXIMAL_VISIBLE_COMMENT_COUNT = 200;
export const MAXIMAL_VISIBLE_PENDING_COMMENT_COUNT = 50;
export const MAXIMAL_RECENT_REACTION_COUNT = 50;
export const MAXIMAL_ADMIN_PARTICIPANT_LIST_COUNT = 5_000;
export const MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT = 1_000_000;
export const WORKSHOP_REALTIME_TOPIC_PREFIX = 'workshop:';
export const WORKSHOP_REALTIME_EVENT_NAME = 'workshop-event';

export const DEFAULT_WORKSHOP_REACTIONS = ['👍', '❤️', '👏', '🔥', '💡', '😂'] as const;

export function getWorkshopSessionCookieName(workshopSlug: string): string {
    return `${WORKSHOP_SESSION_COOKIE_PREFIX}${workshopSlug}`;
}

export function getWorkshopRealtimeTopic(workshopSlug: string): string {
    return `${WORKSHOP_REALTIME_TOPIC_PREFIX}${workshopSlug}`;
}
