import type { z } from 'zod';
import type {
    workshopArtificialCommentSchema,
    workshopArtificialReactionSchema,
    workshopContentCreateSchema,
    workshopContentUpdateSchema,
    workshopCreateSchema,
    workshopUpdateSchema,
} from '@/lib/workshops/workshopSchemas';

type WorkshopCreateValues = z.infer<typeof workshopCreateSchema>;
type WorkshopUpdateValues = z.infer<typeof workshopUpdateSchema>;
type WorkshopContentCreateValues = z.infer<typeof workshopContentCreateSchema>;
type WorkshopContentUpdateValues = z.infer<typeof workshopContentUpdateSchema>;
type WorkshopArtificialCommentValues = z.infer<typeof workshopArtificialCommentSchema>;
type WorkshopArtificialReactionValues = z.infer<typeof workshopArtificialReactionSchema>;

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
    };
}

export function createWorkshopUpdateDatabaseValues(values: WorkshopUpdateValues) {
    return {
        ...(values.title === undefined ? {} : { title: values.title }),
        ...(values.description === undefined ? {} : { description: values.description }),
        ...(values.startsAt === undefined ? {} : { starts_at: values.startsAt }),
        ...(values.endsAt === undefined ? {} : { ends_at: values.endsAt }),
        ...(values.youtubeVideoId === undefined ? {} : { youtube_video_id: values.youtubeVideoId }),
        ...(values.isPublished === undefined ? {} : { is_published: values.isPublished }),
        ...(values.allowedReactions === undefined ? {} : { allowed_reactions: values.allowedReactions }),
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

export function createWorkshopArtificialReactionDatabaseValues(values: WorkshopArtificialReactionValues) {
    return {
        participant_id: null,
        emoji: values.emoji,
        is_artificial: true,
    };
}
