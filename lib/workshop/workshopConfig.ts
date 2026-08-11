/**
 * Names of the database tables which hold everything about a workshop
 *
 * Note: The statements creating them live in `lib/workshop/workshop-tables.sql`.
 */
export const WORKSHOP_SETTINGS_TABLE_NAME = 'WorkshopSettings';
export const WORKSHOP_CONTENT_BLOCK_TABLE_NAME = 'WorkshopContentBlock';
export const WORKSHOP_CHAT_MESSAGE_TABLE_NAME = 'WorkshopChatMessage';
export const WORKSHOP_REACTION_TABLE_NAME = 'WorkshopReaction';

/**
 * How often the participant page asks the server what is new
 *
 * Note: The whole page is fed by one endpoint, so this is also how fast an unlocked content block, a chat message or
 *       a reaction reaches an already connected participant.
 */
export const WORKSHOP_POLLING_INTERVAL_MS = 3000;

/**
 * How many of the newest chat messages are sent to a participant
 */
export const MAXIMAL_SHOWN_CHAT_MESSAGES_COUNT = 100;

/**
 * How far back the reactions are counted
 *
 * Note: A workshop is a matter of hours, so counting the whole day is generous and still keeps the query small.
 */
export const REACTION_HISTORY_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * How long a reaction counts as fresh, which is exactly how long it flies over the stream
 */
export const RECENT_REACTION_DURATION_MS = 12 * 1000;

/**
 * Limits which keep one participant from filling the database with a single request
 */
export const MAXIMAL_PARTICIPANT_NAME_LENGTH = 60;
export const MAXIMAL_CHAT_MESSAGE_LENGTH = 500;
export const MAXIMAL_CONTENT_BLOCK_TITLE_LENGTH = 200;
export const MAXIMAL_CONTENT_BLOCK_MARKDOWN_LENGTH = 20000;
export const MAXIMAL_STREAM_NOTE_LENGTH = 300;

/**
 * Reactions a participant can send
 *
 * Note: The list is closed on purpose - the server accepts nothing else, so no participant can send an arbitrary text
 *       through the reactions.
 */
export const WORKSHOP_REACTION_EMOJIS = ['👏', '🔥', '❤️', '🤯', '😂', '🤔'] as const;

/**
 * One of the reactions a participant can send
 */
export type WorkshopReactionEmoji = (typeof WORKSHOP_REACTION_EMOJIS)[number];

/**
 * Paths of the api endpoints which serve the workshop
 */
export const WORKSHOP_STATE_API_PATH = '/api/workshop/state';
export const WORKSHOP_MESSAGES_API_PATH = '/api/workshop/messages';
export const WORKSHOP_REACTIONS_API_PATH = '/api/workshop/reactions';
export const WORKSHOP_CONTENT_API_PATH = '/api/workshop/content';
export const WORKSHOP_SETTINGS_API_PATH = '/api/workshop/settings';

/**
 * Name of the url query parameter which says which workshop is asked about
 */
export const WORKSHOP_ID_PARAMETER_NAME = 'workshopId';
