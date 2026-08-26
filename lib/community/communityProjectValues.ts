import {
    DEFAULT_COMMUNITY_PROJECT_CATEGORY_KEY,
    isCommunityProjectCategoryKey,
} from '@/lib/community/communityProjectCategories';
import type { CommunityProject, CommunityProjectDraft } from '@/lib/community/communityProjectTypes';

export const MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH = 80;
export const MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH = 400;
export const MINIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH = 10;

const COMMUNITY_PROJECT_ALLOWED_URL_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:']);

export const EMPTY_COMMUNITY_PROJECT_DRAFT: CommunityProjectDraft = {
    title: '',
    description: '',
    url: '',
    categoryKey: DEFAULT_COMMUNITY_PROJECT_CATEGORY_KEY,
};

/**
 * Cleans a shared project the same way it is stored, so a form never validates something else than what is published
 */
export function normalizeCommunityProjectDraft(draft: CommunityProjectDraft): CommunityProjectDraft {
    return {
        title: draft.title.trim(),
        description: draft.description.trim(),
        url: draft.url.trim(),
        categoryKey: isCommunityProjectCategoryKey(draft.categoryKey)
            ? draft.categoryKey
            : DEFAULT_COMMUNITY_PROJECT_CATEGORY_KEY,
    };
}

/**
 * Whether a link leads somewhere a member can really open
 *
 * Note: Only the two protocols a browser follows from a card are accepted, so no `javascript:` link ever reaches the
 *       shared list.
 */
export function isCommunityProjectUrlValid(url: string): boolean {
    try {
        return COMMUNITY_PROJECT_ALLOWED_URL_PROTOCOLS.has(new URL(url.trim()).protocol);
    } catch {
        return false;
    }
}

/**
 * Why a shared project cannot be published yet, or `null` when nothing stands in its way
 *
 * Note: This is the single rule of a shared project, so the form, its submit button and a later server both refuse and
 *       explain exactly the same thing.
 */
export function getCommunityProjectDraftErrorMessage(draft: CommunityProjectDraft): string | null {
    const normalizedDraft = normalizeCommunityProjectDraft(draft);

    if (normalizedDraft.title.length === 0) {
        return 'Vyplňte prosím název projektu.';
    }
    if (normalizedDraft.title.length > MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH) {
        return `Název může mít nejvýše ${MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH} znaků.`;
    }
    if (normalizedDraft.description.length < MINIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH) {
        return `Popište projekt alespoň ${MINIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH} znaky, ať ostatní poznají, o co jde.`;
    }
    if (normalizedDraft.description.length > MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH) {
        return `Popis může mít nejvýše ${MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH} znaků.`;
    }
    if (!isCommunityProjectUrlValid(normalizedDraft.url)) {
        return 'Vložte prosím odkaz začínající na http:// nebo https://.';
    }

    return null;
}

/**
 * The newest project first, which is where a member looks for what the community made since their last visit
 */
export function sortCommunityProjectsByNewest(
    projects: readonly CommunityProject[],
): readonly CommunityProject[] {
    return [...projects].sort((project, otherProject) => otherProject.sharedAt.localeCompare(project.sharedAt));
}

/**
 * The projects of one category, or all of them when no category is chosen
 */
export function filterCommunityProjectsByCategory(
    projects: readonly CommunityProject[],
    categoryKey: string | null,
): readonly CommunityProject[] {
    return categoryKey === null ? projects : projects.filter((project) => project.categoryKey === categoryKey);
}

/**
 * The same projects with one of them liked or unliked by the member reading the community
 *
 * Note: A like is derived from the very flag the card renders, so a repeated click can never count twice.
 */
export function withCommunityProjectLikeToggled(
    projects: readonly CommunityProject[],
    projectId: string,
): readonly CommunityProject[] {
    return projects.map((project) => {
        if (project.id !== projectId) {
            return project;
        }

        const isLikedByMember = !project.isLikedByMember;

        return {
            ...project,
            isLikedByMember,
            likeCount: project.likeCount + (isLikedByMember ? 1 : -1),
        };
    });
}

/**
 * A publishable project made of what a member filled in
 */
export function createCommunityProject(
    draft: CommunityProjectDraft,
    authorFullname: string,
    sharedAt: string,
    id: string,
): CommunityProject {
    return {
        ...normalizeCommunityProjectDraft(draft),
        id,
        authorFullname,
        sharedAt,
        likeCount: 0,
        isLikedByMember: false,
        isSharedByMember: true,
    };
}
