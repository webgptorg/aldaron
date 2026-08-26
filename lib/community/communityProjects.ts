export type CommunityProject = {
    readonly id: string;
    readonly url: string;
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string | null;
    readonly author: string;
    readonly score: number;
    readonly createdAt: string;
};

export type CommunityProjectPreview = Pick<CommunityProject, 'url' | 'title' | 'description' | 'imageUrl'>;

export const MOCK_COMMUNITY_PROJECTS: readonly CommunityProject[] = [
    {
        id: 'project-promptbook-playground',
        url: 'https://promptbook.ai',
        title: 'Promptbook Playground',
        description: 'Místo, kde si zkouším malé AI workflow a sdílím je s komunitou.',
        imageUrl: 'https://promptbook.ai/opengraph-image.png',
        author: 'Pavol',
        score: 24,
        createdAt: '2026-08-20',
    },
    {
        id: 'project-agent-notes',
        url: 'https://example.com/agent-notes',
        title: 'Agent Notes',
        description: 'Jednoduchý katalog poznámek z vývoje s AI agenty.',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        author: 'Veronika',
        score: 17,
        createdAt: '2026-08-18',
    },
    {
        id: 'project-sadovy-asistent',
        url: 'https://example.com/sadovy-asistent',
        title: 'Sadový asistent',
        description: 'Prototyp poradí pěstitelům s plánováním práce v sadu.',
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
        author: 'Michal',
        score: 9,
        createdAt: '2026-08-14',
    },
];
