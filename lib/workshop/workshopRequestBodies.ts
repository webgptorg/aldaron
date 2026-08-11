import {
    MAXIMAL_CONTENT_BLOCK_MARKDOWN_LENGTH,
    MAXIMAL_CONTENT_BLOCK_TITLE_LENGTH,
    MAXIMAL_STREAM_NOTE_LENGTH,
} from '@/lib/workshop/workshopConfig';
import type {
    WorkshopContentBlockChanges,
    WorkshopContentBlockDraft,
    WorkshopSettingsChanges,
} from '@/lib/workshop/workshopTypes';
import {
    readOptionalBoolean,
    readOptionalDateTime,
    readOptionalNumber,
    readRequiredDateTime,
    readRequiredText,
    readText,
} from '@/lib/workshop/workshopValidation';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';

/**
 * Whether the browser really sent the field, which tells "leave it as it is" from "empty it"
 */
function isFieldSent(body: Record<string, unknown>, fieldName: string): boolean {
    return Object.prototype.hasOwnProperty.call(body, fieldName);
}

/**
 * Read a whole new content block out of the request of the administration
 */
export function readContentBlockDraft(body: Record<string, unknown>): WorkshopContentBlockDraft {
    return {
        title: readRequiredText(body.title, MAXIMAL_CONTENT_BLOCK_TITLE_LENGTH, 'title'),
        contentMarkdown: readText(body.contentMarkdown, MAXIMAL_CONTENT_BLOCK_MARKDOWN_LENGTH),
        unlockedAt: readOptionalDateTime(body.unlockedAt, 'unlockedAt'),
        sortOrder: readOptionalNumber(body.sortOrder, 'sortOrder') ?? 0,
    };
}

/**
 * Read only the fields of a content block which the administration really changed
 *
 * Note: A field which was not sent stays as it is, while `unlockedAt` sent as empty locks the block again.
 */
export function readContentBlockChanges(body: Record<string, unknown>): WorkshopContentBlockChanges {
    const contentBlockChanges: {
        title?: string;
        contentMarkdown?: string;
        unlockedAt?: string | null;
        sortOrder?: number;
    } = {};

    if (isFieldSent(body, 'title')) {
        contentBlockChanges.title = readRequiredText(body.title, MAXIMAL_CONTENT_BLOCK_TITLE_LENGTH, 'title');
    }

    if (isFieldSent(body, 'contentMarkdown')) {
        contentBlockChanges.contentMarkdown = readText(body.contentMarkdown, MAXIMAL_CONTENT_BLOCK_MARKDOWN_LENGTH);
    }

    if (isFieldSent(body, 'unlockedAt')) {
        contentBlockChanges.unlockedAt = readOptionalDateTime(body.unlockedAt, 'unlockedAt');
    }

    if (isFieldSent(body, 'sortOrder')) {
        contentBlockChanges.sortOrder = readOptionalNumber(body.sortOrder, 'sortOrder') ?? 0;
    }

    return contentBlockChanges;
}

/**
 * Read only the settings which the administration really changed
 *
 * Note: The video may be filled in as a bare id or as any address YouTube shows, both end up as the same id here.
 */
export function readSettingsChanges(body: Record<string, unknown>): WorkshopSettingsChanges {
    const settingsChanges: {
        title?: string;
        startsAt?: string;
        youtubeVideoId?: string | null;
        isStreamLive?: boolean;
        streamNote?: string | null;
        isChatEnabled?: boolean;
    } = {};

    if (isFieldSent(body, 'title')) {
        settingsChanges.title = readText(body.title, MAXIMAL_CONTENT_BLOCK_TITLE_LENGTH);
    }

    if (isFieldSent(body, 'startsAt')) {
        settingsChanges.startsAt = readRequiredDateTime(body.startsAt, 'startsAt');
    }

    if (isFieldSent(body, 'youtubeVideoId')) {
        settingsChanges.youtubeVideoId = extractYoutubeVideoId(readText(body.youtubeVideoId, 200));
    }

    if (isFieldSent(body, 'isStreamLive')) {
        settingsChanges.isStreamLive = readOptionalBoolean(body.isStreamLive, 'isStreamLive');
    }

    if (isFieldSent(body, 'streamNote')) {
        settingsChanges.streamNote = readText(body.streamNote, MAXIMAL_STREAM_NOTE_LENGTH) || null;
    }

    if (isFieldSent(body, 'isChatEnabled')) {
        settingsChanges.isChatEnabled = readOptionalBoolean(body.isChatEnabled, 'isChatEnabled');
    }

    return settingsChanges;
}
