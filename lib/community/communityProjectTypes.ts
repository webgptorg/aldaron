import type { CommunityProjectCategoryKey } from '@/lib/community/communityProjectCategories';

/**
 * What a member fills in when sharing a project or a creation of theirs
 */
export type CommunityProjectDraft = {
    readonly title: string;
    readonly description: string;
    readonly url: string;
    readonly categoryKey: CommunityProjectCategoryKey;
};

/**
 * One project as the community shows it
 *
 * Note: The community only ever knows the name an author connected with, never their address, exactly like a message
 *       of the chat.
 */
export type CommunityProject = CommunityProjectDraft & {
    readonly id: string;
    readonly authorFullname: string;
    readonly sharedAt: string;
    readonly likeCount: number;

    /**
     * Whether the member reading the community already liked this project
     */
    readonly isLikedByMember: boolean;

    /**
     * Whether this project was shared by the member reading the community, which the card says instead of hiding it
     */
    readonly isSharedByMember: boolean;
};
