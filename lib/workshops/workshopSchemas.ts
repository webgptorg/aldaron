import {
    DEFAULT_WORKSHOP_REACTIONS,
    MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT,
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS,
    MAXIMAL_WORKSHOP_REACTION_LENGTH,
} from '@/lib/workshops/workshopConstants';
import {
    isWorkshopParticipantFullnameValid,
    normalizeWorkshopParticipantFullname,
} from '@/lib/workshops/workshopParticipantFullname';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { z } from 'zod';

const WORKSHOP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nullableTimestampSchema = z.string().datetime({ offset: true }).nullable();
const workshopParticipantFullnameSchema = z
    .string()
    .transform(normalizeWorkshopParticipantFullname)
    .refine(isWorkshopParticipantFullnameValid, 'A participant name is required');
const workshopReactionEmojiSchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_REACTION_LENGTH);
const workshopCommentBodySchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_COMMENT_LENGTH);
const workshopAllowedReactionsSchema = z
    .array(workshopReactionEmojiSchema)
    .min(1)
    .max(12)
    .refine((reactions) => new Set(reactions).size === reactions.length, 'Workshop reactions must be unique');
const nullableYoutubeVideoIdSchema = z.union([z.string().trim().max(2_000), z.null()]).transform((value, context) => {
    if (!value) {
        return null;
    }

    const youtubeVideoId = extractYoutubeVideoId(value);
    if (youtubeVideoId === null) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'A valid YouTube video URL or ID is required' });
        return z.NEVER;
    }
    return youtubeVideoId;
});

export const workshopConnectionSchema = z.object({
    fullname: workshopParticipantFullnameSchema,
    email: z
        .string()
        .trim()
        .email()
        .max(MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH)
        .transform((value) => value.toLowerCase()),
});

export const workshopCommentSchema = z.object({
    body: workshopCommentBodySchema,
});

export const workshopReactionSchema = z.object({
    emoji: workshopReactionEmojiSchema,
});

export const workshopCommentModerationSchema = z.object({
    status: z.enum(['approved', 'rejected']),
});

export const workshopArtificialCommentSchema = z.object({
    authorName: workshopParticipantFullnameSchema,
    body: workshopCommentBodySchema,
});

export const workshopArtificialReactionSchema = workshopReactionSchema;

export const workshopCommentArtificialUpvoteSchema = z.object({
    artificialUpvoteAdjustment: z
        .number()
        .int()
        .min(-MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT)
        .max(MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT)
        .refine((value) => value !== 0, 'Artificial upvote adjustment cannot be zero'),
});

export const workshopParticipantRenameSchema = z.object({
    fullname: workshopParticipantFullnameSchema,
});

export const workshopParticipantUpdateSchema = z
    .object({
        isInteractionBanned: z.boolean().optional(),
        isTrusted: z.boolean().optional(),
    })
    .refine((value) => value.isInteractionBanned !== undefined || value.isTrusted !== undefined, {
        message: 'At least one participant field is required',
    });

export const workshopPresenceSchema = z.object({
    activeDurationSeconds: z.number().int().min(1).max(MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS),
});

export const workshopCreateSchema = z
    .object({
        slug: z.string().trim().min(1).max(100).regex(WORKSHOP_SLUG_PATTERN),
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).default(''),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: nullableTimestampSchema.default(null),
        youtubeVideoId: nullableYoutubeVideoIdSchema.default(null),
        isPublished: z.boolean().default(false),
        allowedReactions: workshopAllowedReactionsSchema.default([...DEFAULT_WORKSHOP_REACTIONS]),
    })
    .refine(({ startsAt, endsAt }) => endsAt === null || Date.parse(endsAt) > Date.parse(startsAt), {
        message: 'Workshop end must be after its start',
        path: ['endsAt'],
    });

export const workshopUpdateSchema = z
    .object({
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().max(2000).optional(),
        startsAt: z.string().datetime({ offset: true }).optional(),
        endsAt: nullableTimestampSchema.optional(),
        youtubeVideoId: nullableYoutubeVideoIdSchema.optional(),
        isPublished: z.boolean().optional(),
        allowedReactions: workshopAllowedReactionsSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one workshop field is required');

const workshopContentFieldsSchema = z.object({
    title: z.string().trim().max(200),
    bodyMarkdown: z.string().trim().min(1).max(100000),
    unlockAt: z.string().datetime({ offset: true }),
    sortOrder: z.number().int().min(-100000).max(100000),
    isPublished: z.boolean(),
});

export const workshopContentCreateSchema = workshopContentFieldsSchema;
export const workshopContentUpdateSchema = workshopContentFieldsSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'At least one content field is required');
