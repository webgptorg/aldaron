import { isCommunityProjectUrl } from '@/lib/community-projects/communityProjectUrl';
import { COMMUNITY_PROJECT_VOTE_VALUES } from '@/lib/community-projects/communityProjectTypes';
import { z } from 'zod';

export const MAXIMAL_COMMUNITY_PROJECT_URL_LENGTH = 2_048;
export const MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH = 200;
export const MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH = 2_000;

const COMMUNITY_PROJECT_URL_SCHEMA = z
    .string()
    .trim()
    .min(1)
    .max(MAXIMAL_COMMUNITY_PROJECT_URL_LENGTH)
    .refine(isCommunityProjectUrl);

export const communityProjectIdSchema = z.string().uuid();

export const communityProjectPreviewSchema = z.object({
    url: COMMUNITY_PROJECT_URL_SCHEMA,
});

export const communityProjectCreateSchema = z.object({
    url: COMMUNITY_PROJECT_URL_SCHEMA,
    title: z.string().trim().min(1).max(MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH),
    description: z.string().trim().max(MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH),
});

export const communityProjectVoteSchema = z.object({
    vote: z.enum(COMMUNITY_PROJECT_VOTE_VALUES),
});
