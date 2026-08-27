import {
    connectCommunityProjectDiscussionInTransaction,
    createCommunityProjectInTransaction,
    deleteCommunityParticipantWithProjectVotesInTransaction,
    setCommunityProjectVoteInTransaction,
} from '@/lib/community-projects/communityProjectService';
import type { DatabaseTransaction } from '@/lib/database/runDatabaseTransaction';
import { describe, expect, it } from 'vitest';

type DatabaseQueryCall = {
    readonly queryText: string;
    readonly values: readonly unknown[];
};

function createFakeTransaction(
    getRows: (queryText: string, values: readonly unknown[]) => readonly Record<string, unknown>[],
): { readonly transaction: DatabaseTransaction; readonly queryCalls: DatabaseQueryCall[] } {
    const queryCalls: DatabaseQueryCall[] = [];

    const transaction = {
        query: async (queryText: string, values: readonly unknown[] = []) => {
            queryCalls.push({ queryText, values });
            return { rows: getRows(queryText, values) };
        },
    } as DatabaseTransaction;

    return { transaction, queryCalls };
}

function findQueryCall(queryCalls: readonly DatabaseQueryCall[], queryFragment: string): DatabaseQueryCall {
    const queryCall = queryCalls.find(({ queryText }) => queryText.includes(queryFragment));
    if (queryCall === undefined) {
        throw new Error(`Expected a query containing: ${queryFragment}`);
    }

    return queryCall;
}

describe('community project backend service', () => {
    it('creates every project row with backend-generated identities and an author moderator', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const { transaction, queryCalls } = createFakeTransaction((queryText) =>
            queryText.includes('SELECT community_participant.id')
                ? [{ id: communityParticipantId, fullname: 'Ada Lovelace', email: 'ada@example.com' }]
                : [],
        );

        const projectId = await createCommunityProjectInTransaction(transaction, {
            communityParticipantId,
            url: 'https://example.com/project',
            title: 'Analytical engine',
            description: 'A community project.',
            previewImageUrl: 'https://example.com/preview.png',
        });

        expect(projectId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

        const workshopInsert = findQueryCall(queryCalls, 'INSERT INTO public.workshops');
        const discussionWorkshopId = String(workshopInsert.values[0]);
        expect(discussionWorkshopId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(workshopInsert.values).toContain(`community-project-${discussionWorkshopId.replace(/-/g, '')}`);
        expect(workshopInsert.values).toContain('project');

        const projectInsert = findQueryCall(queryCalls, 'INSERT INTO public.community_projects');
        expect(projectInsert.values.slice(0, 7)).toEqual([
            projectId,
            communityParticipantId,
            discussionWorkshopId,
            'https://example.com/project',
            'Analytical engine',
            'A community project.',
            'https://example.com/preview.png',
        ]);

        const participantInsert = findQueryCall(queryCalls, 'INSERT INTO public.workshop_participants');
        expect(participantInsert.values[2]).toBe('Ada Lovelace');
        expect(participantInsert.values[3]).toBe('ada@example.com');
        expect(participantInsert.values[4]).toMatch(/^[a-f0-9]{64}$/);
        expect(participantInsert.values[5]).toBe(true);

        const discussionMappingInsert = findQueryCall(
            queryCalls,
            'INSERT INTO public.community_project_discussion_participants',
        );
        expect(discussionMappingInsert.values[0]).toBe(projectId);
        expect(discussionMappingInsert.values[1]).toBe(communityParticipantId);
        expect(discussionMappingInsert.values[2]).toBe(participantInsert.values[0]);
        expect(queryCalls.some(({ queryText }) => queryText.includes('gen_random'))).toBe(false);
    });

    it('refuses to create a project for a participant outside the permanent community', async () => {
        const { transaction, queryCalls } = createFakeTransaction(() => []);

        await expect(
            createCommunityProjectInTransaction(transaction, {
                communityParticipantId: '11111111-1111-4111-8111-111111111111',
                url: 'https://example.com/project',
                title: 'Analytical engine',
                description: '',
                previewImageUrl: null,
            }),
        ).rejects.toThrow('COMMUNITY_PROJECT_MEMBER_INVALID');
        expect(queryCalls).toHaveLength(1);
    });

    it('refreshes a mapped project author and preserves their moderator role', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const projectId = '22222222-2222-4222-8222-222222222222';
        const discussionWorkshopId = '33333333-3333-4333-8333-333333333333';
        const discussionParticipantId = '44444444-4444-4444-8444-444444444444';
        const { transaction, queryCalls } = createFakeTransaction((queryText) => {
            if (queryText.includes('SELECT community_participant.id')) {
                return [{ id: communityParticipantId, fullname: 'Ada Lovelace', email: 'ada@example.com' }];
            }
            if (queryText.includes('community_project.discussion_workshop_id')) {
                return [
                    {
                        discussion_workshop_id: discussionWorkshopId,
                        discussion_workshop_slug: 'community-project-example',
                        author_community_participant_id: communityParticipantId,
                    },
                ];
            }
            if (queryText.includes('SELECT discussion_participant_id')) {
                return [{ discussion_participant_id: discussionParticipantId }];
            }
            if (queryText.includes('SELECT id, is_moderator')) {
                return [{ id: discussionParticipantId, is_moderator: false }];
            }

            return [];
        });

        await expect(
            connectCommunityProjectDiscussionInTransaction(transaction, projectId, communityParticipantId),
        ).resolves.toEqual({
            discussionWorkshopId,
            discussionWorkshopSlug: 'community-project-example',
            discussionParticipantId,
        });

        const participantUpdate = findQueryCall(queryCalls, 'UPDATE public.workshop_participants');
        expect(participantUpdate.values).toEqual([
            discussionParticipantId,
            'Ada Lovelace',
            'ada@example.com',
            true,
            discussionWorkshopId,
        ]);
        expect(findQueryCall(queryCalls, 'SELECT id, is_moderator').queryText).toContain('FOR UPDATE');
        expect(queryCalls.some(({ queryText }) => queryText.includes('INSERT INTO public.workshop_participants'))).toBe(
            false,
        );
    });

    it('creates one mapped discussion identity for a newly connected member', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const projectId = '22222222-2222-4222-8222-222222222222';
        const discussionWorkshopId = '33333333-3333-4333-8333-333333333333';
        const { transaction, queryCalls } = createFakeTransaction((queryText) => {
            if (queryText.includes('SELECT community_participant.id')) {
                return [{ id: communityParticipantId, fullname: 'Grace Hopper', email: 'grace@example.com' }];
            }
            if (queryText.includes('community_project.discussion_workshop_id')) {
                return [
                    {
                        discussion_workshop_id: discussionWorkshopId,
                        discussion_workshop_slug: 'community-project-example',
                        author_community_participant_id: '55555555-5555-4555-8555-555555555555',
                    },
                ];
            }

            return [];
        });

        const connection = await connectCommunityProjectDiscussionInTransaction(
            transaction,
            projectId,
            communityParticipantId,
        );
        const participantInsert = findQueryCall(queryCalls, 'INSERT INTO public.workshop_participants');
        const discussionMappingInsert = findQueryCall(
            queryCalls,
            'INSERT INTO public.community_project_discussion_participants',
        );

        expect(connection.discussionParticipantId).toBe(participantInsert.values[0]);
        expect(participantInsert.values[5]).toBe(false);
        expect(discussionMappingInsert.values.slice(0, 3)).toEqual([
            projectId,
            communityParticipantId,
            connection.discussionParticipantId,
        ]);
    });

    it('toggles the same vote off and persists the recalculated cached totals', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const projectId = '22222222-2222-4222-8222-222222222222';
        const { transaction, queryCalls } = createFakeTransaction((queryText) => {
            if (queryText.includes('SELECT community_participant.id')) {
                return [{ id: communityParticipantId, fullname: 'Ada Lovelace', email: 'ada@example.com' }];
            }
            if (queryText.includes('SELECT upvote_count, downvote_count')) {
                return [{ upvote_count: 7, downvote_count: 3 }];
            }
            if (queryText.includes('SELECT vote')) {
                return [{ vote: 1 }];
            }

            return [];
        });

        await expect(
            setCommunityProjectVoteInTransaction(transaction, projectId, communityParticipantId, 'up'),
        ).resolves.toEqual({
            vote: null,
            upvoteCount: 6,
            downvoteCount: 3,
        });
        expect(findQueryCall(queryCalls, 'DELETE FROM public.community_project_votes').values).toEqual([
            projectId,
            communityParticipantId,
        ]);
        expect(findQueryCall(queryCalls, 'UPDATE public.community_projects').values.slice(0, 3)).toEqual([
            projectId,
            6,
            3,
        ]);
    });

    it('adds a first downvote and keeps the two cached counters independent', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const projectId = '22222222-2222-4222-8222-222222222222';
        const { transaction, queryCalls } = createFakeTransaction((queryText) => {
            if (queryText.includes('SELECT community_participant.id')) {
                return [{ id: communityParticipantId, fullname: 'Ada Lovelace', email: 'ada@example.com' }];
            }
            if (queryText.includes('SELECT upvote_count, downvote_count')) {
                return [{ upvote_count: 7, downvote_count: 3 }];
            }

            return [];
        });

        await expect(
            setCommunityProjectVoteInTransaction(transaction, projectId, communityParticipantId, 'down'),
        ).resolves.toEqual({
            vote: 'down',
            upvoteCount: 7,
            downvoteCount: 4,
        });
        expect(findQueryCall(queryCalls, 'INSERT INTO public.community_project_votes').values.slice(0, 3)).toEqual([
            projectId,
            communityParticipantId,
            -1,
        ]);
    });

    it('reconciles every vote before deleting a community participant', async () => {
        const communityParticipantId = '11111111-1111-4111-8111-111111111111';
        const upvotedProjectId = '22222222-2222-4222-8222-222222222222';
        const downvotedProjectId = '33333333-3333-4333-8333-333333333333';
        const { transaction, queryCalls } = createFakeTransaction((queryText) => {
            if (queryText.includes('SELECT community_participant.id')) {
                return [{ id: communityParticipantId, fullname: 'Ada Lovelace', email: 'ada@example.com' }];
            }
            if (queryText.includes('community_project_vote.project_id')) {
                return [
                    { project_id: upvotedProjectId, vote: 1, upvote_count: 4, downvote_count: 2 },
                    { project_id: downvotedProjectId, vote: -1, upvote_count: 7, downvote_count: 3 },
                ];
            }
            if (queryText.includes('DELETE FROM public.workshop_participants')) {
                return [{ id: communityParticipantId }];
            }

            return [];
        });

        await expect(
            deleteCommunityParticipantWithProjectVotesInTransaction(transaction, communityParticipantId),
        ).resolves.toBe(communityParticipantId);

        expect(findQueryCall(queryCalls, 'FOR UPDATE OF community_participant')).toBeDefined();
        expect(findQueryCall(queryCalls, 'FOR UPDATE OF community_project')).toBeDefined();
        expect(findQueryCall(queryCalls, 'DELETE FROM public.community_project_votes').values).toEqual([
            communityParticipantId,
        ]);
        expect(
            queryCalls
                .filter(({ queryText }) => queryText.includes('UPDATE public.community_projects'))
                .map(({ values }) => values.slice(0, 3)),
        ).toEqual([
            [upvotedProjectId, 3, 2],
            [downvotedProjectId, 7, 2],
        ]);
        expect(findQueryCall(queryCalls, 'DELETE FROM public.workshop_participants').values).toEqual([
            communityParticipantId,
        ]);
    });
});
