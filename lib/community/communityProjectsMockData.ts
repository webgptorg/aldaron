import type { CommunityProject } from '@/lib/community/communityProjectTypes';

/**
 * The projects the community shows until it really stores them
 *
 * Note: Nothing of this is written anywhere. It is deliberately kept as one plain list behind the same type a stored
 *       project has, so replacing it with a repository later touches nothing but the hook which reads it.
 */
export const MOCK_COMMUNITY_PROJECTS: readonly CommunityProject[] = [
    {
        id: 'mock-community-project-nabidky',
        title: 'Generátor nabídek z e-mailu',
        description:
            'Agent přečte poptávku z e-mailu, doplní ceny z našeho ceníku a připraví nabídku k odeslání. Ušetří nám asi hodinu denně, zajímá mě, jak to řešíte vy.',
        url: 'https://example.com/generator-nabidek',
        categoryKey: 'ai-automation',
        authorFullname: 'Tereza Nováková',
        sharedAt: '2026-08-21T09:12:00.000Z',
        likeCount: 14,
        isLikedByMember: false,
        isSharedByMember: false,
    },
    {
        id: 'mock-community-project-mapa',
        title: 'Mapa lokálních iniciativ',
        description:
            'Víkendový projekt: mapa spolků a iniciativ v našem kraji. Celý frontend jsem psal s agentem podle promptbooku z workshopu, uvítám zpětnou vazbu na strukturu dat.',
        url: 'https://example.com/mapa-iniciativ',
        categoryKey: 'application',
        authorFullname: 'Martin Dvořák',
        sharedAt: '2026-08-18T17:40:00.000Z',
        likeCount: 9,
        isLikedByMember: true,
        isSharedByMember: false,
    },
    {
        id: 'mock-community-project-mikropribehy',
        title: 'Mikropříběhy z vývoje',
        description:
            'Série krátkých textů o tom, co se nám povedlo zautomatizovat a co naopak zůstalo na lidech. Píšu je s Claudem, ale rešerši dělám sám.',
        url: 'https://example.com/mikropribehy',
        categoryKey: 'content',
        authorFullname: 'Klára Benešová',
        sharedAt: '2026-08-14T07:05:00.000Z',
        likeCount: 21,
        isLikedByMember: false,
        isSharedByMember: false,
    },
    {
        id: 'mock-community-project-knihovna-promptu',
        title: 'Knihovna promptů pro code review',
        description:
            'Sada promptů, kterou používáme na revize pull requestů. Obsahuje i checklist, co agentovi nikdy nesvěřit.',
        url: 'https://github.com/example/code-review-prompts',
        categoryKey: 'prompt-library',
        authorFullname: 'Ondřej Marek',
        sharedAt: '2026-08-09T12:30:00.000Z',
        likeCount: 33,
        isLikedByMember: false,
        isSharedByMember: false,
    },
];
