/**
 * One kind of creation a member can share in the community
 */
export type CommunityProjectCategoryDefinition = {
    readonly key: string;

    /**
     * How the community calls this kind of creation
     */
    readonly label: string;

    /**
     * The colours a card of this category is drawn with, so a member recognizes the kind of a project before reading it
     */
    readonly accentClassName: string;
    readonly badgeClassName: string;
};

/**
 * Every category a shared project can have, in the order the sharing form offers them
 *
 * Note: This is the one place a category is described. The filter, the form and the cards all read it, so a category
 *       added later needs no change of any of them.
 */
export const COMMUNITY_PROJECT_CATEGORY_DEFINITIONS = [
    {
        key: 'ai-automation',
        label: 'AI a automatizace',
        accentClassName: 'from-cyan-300/40 to-blue-500/10',
        badgeClassName: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
    },
    {
        key: 'application',
        label: 'Aplikace a weby',
        accentClassName: 'from-violet-300/40 to-fuchsia-500/10',
        badgeClassName: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
    },
    {
        key: 'content',
        label: 'Obsah a tvorba',
        accentClassName: 'from-amber-300/40 to-orange-500/10',
        badgeClassName: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
    },
    {
        key: 'prompt-library',
        label: 'Prompty a knihovny',
        accentClassName: 'from-emerald-300/40 to-teal-500/10',
        badgeClassName: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
    },
    {
        key: 'other',
        label: 'Ostatní',
        accentClassName: 'from-slate-300/30 to-slate-500/10',
        badgeClassName: 'border-white/15 bg-white/[0.06] text-slate-200',
    },
] as const satisfies readonly CommunityProjectCategoryDefinition[];

type RegisteredCommunityProjectCategoryDefinition = (typeof COMMUNITY_PROJECT_CATEGORY_DEFINITIONS)[number];

export type CommunityProjectCategoryKey = RegisteredCommunityProjectCategoryDefinition['key'];

export const DEFAULT_COMMUNITY_PROJECT_CATEGORY_KEY: CommunityProjectCategoryKey =
    COMMUNITY_PROJECT_CATEGORY_DEFINITIONS[0].key;

export function isCommunityProjectCategoryKey(value: unknown): value is CommunityProjectCategoryKey {
    return COMMUNITY_PROJECT_CATEGORY_DEFINITIONS.some((categoryDefinition) => categoryDefinition.key === value);
}

/**
 * How one category is drawn and named
 *
 * Note: A project whose category this version of the community does not know is still shown, as the neutral category,
 *       rather than disappearing from the shared list.
 */
export function getCommunityProjectCategoryDefinition(
    categoryKey: string,
): RegisteredCommunityProjectCategoryDefinition {
    return (
        COMMUNITY_PROJECT_CATEGORY_DEFINITIONS.find((categoryDefinition) => categoryDefinition.key === categoryKey) ??
        COMMUNITY_PROJECT_CATEGORY_DEFINITIONS[COMMUNITY_PROJECT_CATEGORY_DEFINITIONS.length - 1]
    );
}
