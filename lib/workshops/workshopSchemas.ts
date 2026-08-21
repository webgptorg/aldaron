import {
    DEFAULT_WORKSHOP_REACTIONS,
    MAXIMAL_ARTIFICIAL_UPVOTE_ADJUSTMENT,
    MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT,
    MAXIMAL_WORKSHOP_COMMENT_LENGTH,
    MAXIMAL_WORKSHOP_PARTICIPANT_EMAIL_LENGTH,
    MAXIMAL_WORKSHOP_PRESENCE_REPORT_SECONDS,
    MAXIMAL_WORKSHOP_REACTION_LENGTH,
} from '@/lib/workshops/workshopConstants';
import {
    isWorkshopParticipantFullnameValid,
    normalizeWorkshopParticipantFullname,
} from '@/lib/workshops/workshopParticipantFullname';
import { isWorkshopPanelKey, WORKSHOP_PANEL_DEFINITIONS, type WorkshopPanelKey } from '@/lib/workshops/workshopPanels';
import { extractYoutubeVideoId } from '@/lib/youtube/youtubeEmbed';
import { z } from 'zod';

const WORKSHOP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nullableTimestampSchema = z.string().datetime({ offset: true }).nullable();
const WORKSHOP_SLUG_SCHEMA = z.string().trim().min(1).max(100).regex(WORKSHOP_SLUG_PATTERN);
const workshopParticipantFullnameSchema = z
    .string()
    .transform(normalizeWorkshopParticipantFullname)
    .refine(isWorkshopParticipantFullnameValid, 'A participant name is required');
const workshopReactionEmojiSchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_REACTION_LENGTH);
const workshopCommentBodySchema = z.string().trim().min(1).max(MAXIMAL_WORKSHOP_COMMENT_LENGTH);
const workshopAllowedReactionsSchema = z
    .array(workshopReactionEmojiSchema)
    .min(1)
    .max(MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT)
    .refine((reactions) => new Set(reactions).size === reactions.length, 'Workshop reactions must be unique');

/**
 * The panels an admin switched off, validated against the very registry the room reads
 *
 * Note: A key nothing knows is refused instead of stored, so a typo cannot silently hide a panel of the room.
 */
const workshopDisabledPanelsSchema = z
    .array(z.custom<WorkshopPanelKey>(isWorkshopPanelKey, 'Unknown workshop panel'))
    .max(WORKSHOP_PANEL_DEFINITIONS.length)
    .refine((panelKeys) => new Set(panelKeys).size === panelKeys.length, 'Workshop panels must be unique');
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

    /**
     * The comment this one answers, left out or `null` when it opens its own thread
     */
    parentCommentId: z.string().uuid().nullable().default(null),
});

export const workshopReactionSchema = z.object({
    emoji: workshopReactionEmojiSchema,
});

/**
 * Every change an admin can make to a comment which is already in the chat
 *
 * Note: Moderating a comment, correcting its text, and pinning it share this one request, so that all of them reach
 *       the room the same way.
 */
export const workshopCommentUpdateSchema = z
    .object({
        status: z.enum(['approved', 'rejected']).optional(),
        body: workshopCommentBodySchema.optional(),

        /**
         * Whether this message holds the top of the chat, which releases the previously pinned one
         */
        isPinned: z.boolean().optional(),
    })
    .refine(
        (value) => value.status !== undefined || value.body !== undefined || value.isPinned !== undefined,
        'At least one comment field is required',
    )
    .refine(
        (value) => !(value.isPinned === true && value.status === 'rejected'),
        'A rejected comment cannot be pinned on top of the chat',
    );

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
        slug: WORKSHOP_SLUG_SCHEMA,
        title: z.string().trim().min(1).max(200),
        description: z.string().trim().max(2000).default(''),
        startsAt: z.string().datetime({ offset: true }),
        endsAt: nullableTimestampSchema.default(null),
        youtubeVideoId: nullableYoutubeVideoIdSchema.default(null),
        isPublished: z.boolean().default(false),
        allowedReactions: workshopAllowedReactionsSchema.default([...DEFAULT_WORKSHOP_REACTIONS]),
        disabledPanels: workshopDisabledPanelsSchema.default([]),
    })
    .refine(({ startsAt, endsAt }) => endsAt === null || Date.parse(endsAt) > Date.parse(startsAt), {
        message: 'Workshop end must be after its start',
        path: ['endsAt'],
    });

export const workshopUpdateSchema = z
    .object({
        slug: WORKSHOP_SLUG_SCHEMA.optional(),
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().max(2000).optional(),
        startsAt: z.string().datetime({ offset: true }).optional(),
        endsAt: nullableTimestampSchema.optional(),
        youtubeVideoId: nullableYoutubeVideoIdSchema.optional(),
        isPublished: z.boolean().optional(),
        allowedReactions: workshopAllowedReactionsSchema.optional(),
        disabledPanels: workshopDisabledPanelsSchema.optional(),
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
