'use client';

import type { CommunityProject, CommunityProjectDraft } from '@/lib/community/communityProjectTypes';
import {
    createCommunityProject,
    filterCommunityProjectsByCategory,
    sortCommunityProjectsByNewest,
    withCommunityProjectLikeToggled,
} from '@/lib/community/communityProjectValues';
import { MOCK_COMMUNITY_PROJECTS } from '@/lib/community/communityProjectsMockData';
import { useCallback, useMemo, useState } from 'react';

const NEW_COMMUNITY_PROJECT_ID_PREFIX = 'mock-community-project-shared';

type CommunityProjectsController = {
    /**
     * The projects of the chosen category, newest first
     */
    readonly shownProjects: readonly CommunityProject[];
    readonly sharedProjectCount: number;
    readonly selectedCategoryKey: string | null;
    readonly selectCategory: (categoryKey: string | null) => void;
    readonly shareProject: (draft: CommunityProjectDraft) => void;
    readonly toggleProjectLike: (projectId: string) => void;
};

/**
 * Keeps the shared projects of the community for as long as the room is open
 *
 * Note: The list starts as mock data and lives in the browser only, so nothing here writes a project anywhere. Every
 *       change of it goes through the shared pure rules, which a stored list will follow just as well.
 */
export function useCommunityProjects(authorFullname: string): CommunityProjectsController {
    const [projects, setProjects] = useState<readonly CommunityProject[]>(MOCK_COMMUNITY_PROJECTS);
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

    const shareProject = useCallback(
        (draft: CommunityProjectDraft) => {
            setProjects((currentProjects) => [
                createCommunityProject(
                    draft,
                    authorFullname,
                    new Date().toISOString(),
                    `${NEW_COMMUNITY_PROJECT_ID_PREFIX}-${currentProjects.length + 1}`,
                ),
                ...currentProjects,
            ]);
        },
        [authorFullname],
    );

    const toggleProjectLike = useCallback((projectId: string) => {
        setProjects((currentProjects) => withCommunityProjectLikeToggled(currentProjects, projectId));
    }, []);

    const shownProjects = useMemo(
        () => sortCommunityProjectsByNewest(filterCommunityProjectsByCategory(projects, selectedCategoryKey)),
        [projects, selectedCategoryKey],
    );

    return {
        shownProjects,
        sharedProjectCount: projects.length,
        selectedCategoryKey,
        selectCategory: setSelectedCategoryKey,
        shareProject,
        toggleProjectLike,
    };
}
