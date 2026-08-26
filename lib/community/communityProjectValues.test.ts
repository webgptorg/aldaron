import type { CommunityProject, CommunityProjectDraft } from '@/lib/community/communityProjectTypes';
import {
    createCommunityProject,
    filterCommunityProjectsByCategory,
    getCommunityProjectDraftErrorMessage,
    MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH,
    normalizeCommunityProjectDraft,
    sortCommunityProjectsByNewest,
    withCommunityProjectLikeToggled,
} from '@/lib/community/communityProjectValues';
import { describe, expect, it } from 'vitest';

const VALID_DRAFT: CommunityProjectDraft = {
    title: 'Generátor nabídek',
    description: 'Agent, který připraví nabídku z poptávky v e-mailu.',
    url: 'https://example.com/nabidky',
    categoryKey: 'ai-automation',
};

function createTestProject(values: Partial<CommunityProject>): CommunityProject {
    return {
        id: 'project',
        title: 'Projekt',
        description: 'Popis projektu, který je dost dlouhý.',
        url: 'https://example.com',
        categoryKey: 'application',
        authorFullname: 'Člen komunity',
        sharedAt: '2026-08-01T10:00:00.000Z',
        likeCount: 0,
        isLikedByMember: false,
        isSharedByMember: false,
        ...values,
    };
}

describe('shared community project values', () => {
    it('accepts a filled-in project and refuses each missing part with its own reason', () => {
        expect(getCommunityProjectDraftErrorMessage(VALID_DRAFT)).toBe(null);
        expect(getCommunityProjectDraftErrorMessage({ ...VALID_DRAFT, title: '   ' })).toContain('název');
        expect(
            getCommunityProjectDraftErrorMessage({
                ...VALID_DRAFT,
                title: 'a'.repeat(MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH + 1),
            }),
        ).toContain('nejvýše');
        expect(getCommunityProjectDraftErrorMessage({ ...VALID_DRAFT, description: 'Krátké' })).toContain('alespoň');
    });

    it('refuses a link a member could not safely open', () => {
        expect(getCommunityProjectDraftErrorMessage({ ...VALID_DRAFT, url: 'promptbook.studio' })).toContain('odkaz');
        expect(
            getCommunityProjectDraftErrorMessage({ ...VALID_DRAFT, url: 'javascript:alert(1)' }),
        ).toContain('odkaz');
        expect(getCommunityProjectDraftErrorMessage({ ...VALID_DRAFT, url: ' http://example.com ' })).toBe(null);
    });

    it('publishes a project the way it is written, trimmed and attributed to its author', () => {
        const project = createCommunityProject(
            { ...VALID_DRAFT, title: '  Generátor nabídek  ' },
            'Tereza Nováková',
            '2026-08-26T08:00:00.000Z',
            'shared-1',
        );

        expect(project.title).toBe('Generátor nabídek');
        expect(project.authorFullname).toBe('Tereza Nováková');
        expect(project.likeCount).toBe(0);
        expect(project.isSharedByMember).toBe(true);
    });

    it('falls back to the default category of an unknown one', () => {
        const normalizedDraft = normalizeCommunityProjectDraft({
            ...VALID_DRAFT,
            categoryKey: 'nonexistent' as CommunityProjectDraft['categoryKey'],
        });

        expect(normalizedDraft.categoryKey).toBe('ai-automation');
    });

    it('shows the newest project first and only the chosen category', () => {
        const projects = [
            createTestProject({ id: 'older', sharedAt: '2026-08-01T10:00:00.000Z' }),
            createTestProject({ id: 'newer', sharedAt: '2026-08-20T10:00:00.000Z', categoryKey: 'content' }),
        ];

        expect(sortCommunityProjectsByNewest(projects).map((project) => project.id)).toEqual(['newer', 'older']);
        expect(filterCommunityProjectsByCategory(projects, 'content').map((project) => project.id)).toEqual(['newer']);
        expect(filterCommunityProjectsByCategory(projects, null)).toHaveLength(2);
    });

    it('counts a like once however often it is pressed', () => {
        const projects = [createTestProject({ id: 'liked', likeCount: 4 })];

        const likedProjects = withCommunityProjectLikeToggled(projects, 'liked');
        expect(likedProjects[0].likeCount).toBe(5);
        expect(likedProjects[0].isLikedByMember).toBe(true);

        const unlikedProjects = withCommunityProjectLikeToggled(likedProjects, 'liked');
        expect(unlikedProjects[0].likeCount).toBe(4);
        expect(unlikedProjects[0].isLikedByMember).toBe(false);
    });
});
