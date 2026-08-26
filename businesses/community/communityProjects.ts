export type CommunityProject = {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly authorName: string;
    readonly category: string;
    readonly url: string;
    readonly accentClassName: string;
};

/**
 * Presentation data for the community prototype. Keeping it outside the component makes the mock easy to replace
 * with a repository later, without coupling the panel to the database.
 */
export const MOCK_COMMUNITY_PROJECTS: readonly CommunityProject[] = [
    {
        id: 'mock-project-promptbook-starter',
        title: 'Promptbook Starter Kit',
        description: 'Sada promptů a checklistů pro první bezpečné experimenty s AI v týmu.',
        authorName: 'Tereza Nováková',
        category: 'AI a produktivita',
        url: 'https://github.com/promptbook-ai/starter-kit',
        accentClassName: 'from-cyan-300/30 to-blue-500/10',
    },
    {
        id: 'mock-project-community-map',
        title: 'Mapa lokálních iniciativ',
        description: 'Jednoduchá mapa projektů, které propojují technologie s děním v místních komunitách.',
        authorName: 'Martin Dvořák',
        category: 'Web a data',
        url: 'https://example.com/mapa-iniciativ',
        accentClassName: 'from-violet-300/30 to-fuchsia-500/10',
    },
    {
        id: 'mock-project-micro-stories',
        title: 'Mikropříběhy z vývoje',
        description: 'Krátké ilustrace o tom, co se podařilo automatizovat a co naopak zůstává lidské.',
        authorName: 'Klára Benešová',
        category: 'Tvorba a obsah',
        url: 'https://example.com/mikropribehy',
        accentClassName: 'from-amber-300/30 to-orange-500/10',
    },
];
