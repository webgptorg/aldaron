import type { z } from 'zod';
import type {
    workshopArtificialCommentSchema,
    workshopCommentUpdateSchema,
    workshopContentCreateSchema,
    workshopContentUpdateSchema,
    workshopCreateSchema,
    workshopUpdateSchema,
} from '@/lib/workshops/workshopSchemas';

type WorkshopCreateValues = z.infer<typeof workshopCreateSchema>;
type WorkshopUpdateValues = z.infer<typeof workshopUpdateSchema>;
type WorkshopContentCreateValues = z.infer<typeof workshopContentCreateSchema>;
type WorkshopContentUpdateValues = z.infer<typeof workshopContentUpdateSchema>;
type WorkshopCommentUpdateValues = z.infer<typeof workshopCommentUpdateSchema>;
type WorkshopArtificialCommentValues = z.infer<typeof workshopArtificialCommentSchema>;

export function createWorkshopDatabaseValues(values: WorkshopCreateValues) {
    return {
        slug: values.slug,
        title: values.title,
        description: values.description,
        starts_at: values.startsAt,
        ends_at: values.endsAt,
        youtube_video_id: values.youtubeVideoId,
        is_published: values.isPublished,
        allowed_reactions: values.allowedReactions,
        disabled_panels: values.disabledPanels,
    };
}

export function createWorkshopUpdateDatabaseValues(values: WorkshopUpdateValues) {
    return {
        ...(values.slug === undefined ? {} : { slug: values.slug }),
        ...(values.title === undefined ? {} : { title: values.title }),
        ...(values.description === undefined ? {} : { description: values.description }),
        ...(values.startsAt === undefined ? {} : { starts_at: values.startsAt }),
        ...(values.endsAt === undefined ? {} : { ends_at: values.endsAt }),
        ...(values.youtubeVideoId === undefined ? {} : { youtube_video_id: values.youtubeVideoId }),
        ...(values.isPublished === undefined ? {} : { is_published: values.isPublished }),
        ...(values.allowedReactions === undefined ? {} : { allowed_reactions: values.allowedReactions }),
        ...(values.disabledPanels === undefined ? {} : { disabled_panels: values.disabledPanels }),
    };
}

export function createWorkshopContentDatabaseValues(values: WorkshopContentCreateValues) {
    return {
        title: values.title,
        body_markdown: values.bodyMarkdown,
        unlock_at: values.unlockAt,
        sort_order: values.sortOrder,
        is_published: values.isPublished,
    };
}

export function createWorkshopContentUpdateDatabaseValues(values: WorkshopContentUpdateValues) {
    return {
        ...(values.title === undefined ? {} : { title: values.title }),
        ...(values.bodyMarkdown === undefined ? {} : { body_markdown: values.bodyMarkdown }),
        ...(values.unlockAt === undefined ? {} : { unlock_at: values.unlockAt }),
        ...(values.sortOrder === undefined ? {} : { sort_order: values.sortOrder }),
        ...(values.isPublished === undefined ? {} : { is_published: values.isPublished }),
    };
}

/**
 * Note: Only a decision about the comment is a moderation, a corrected text leaves the moderation timestamp alone.
 * Note: A pinned message is there for the whole room to read, so pinning approves the message together with pinning it.
 */
export function createWorkshopCommentUpdateDatabaseValues(values: WorkshopCommentUpdateValues) {
    const status = values.status ?? (values.isPinned === true ? 'approved' : undefined);

    return {
        ...(status === undefined ? {} : { status, moderated_at: new Date().toISOString() }),
        ...(values.body === undefined ? {} : { body: values.body }),
    };
}

/**
 * Whether an admin change pins the comment on top of the chat, releases the top again, or leaves the pin alone
 *
 * Note: A rejected message leaves the top of the chat, because the room does not see it anymore.
 */
export function getWorkshopCommentPinChange(values: WorkshopCommentUpdateValues): boolean | null {
    if (values.status === 'rejected') {
        return false;
    }

    return values.isPinned ?? null;
}

export function createWorkshopArtificialCommentDatabaseValues(values: WorkshopArtificialCommentValues) {
    return {
        participant_id: null,
        author_name: values.authorName,
        body: values.body,
        status: 'approved',
        is_artificial: true,
        moderated_at: new Date().toISOString(),
    };
}
