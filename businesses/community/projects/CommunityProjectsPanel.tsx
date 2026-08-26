'use client';

import { CommunityProjectCard } from '@/businesses/community/projects/CommunityProjectCard';
import {
    CommunityProjectCategoryChips,
    type CommunityProjectCategoryChoice,
} from '@/businesses/community/projects/CommunityProjectCategoryChips';
import { CommunityProjectShareForm } from '@/businesses/community/projects/CommunityProjectShareForm';
import { useCommunityProjects } from '@/businesses/community/projects/useCommunityProjects';
import { Button } from '@/components/ui/button';
import { COMMUNITY_PROJECT_CATEGORY_DEFINITIONS } from '@/lib/community/communityProjectCategories';
import { Plus, Rocket } from 'lucide-react';
import { useState } from 'react';

const ALL_CATEGORIES_CHOICE_LABEL = 'Vše';

const COMMUNITY_PROJECT_FILTER_CHOICES: readonly CommunityProjectCategoryChoice<string | null>[] = [
    { key: null, label: ALL_CATEGORIES_CHOICE_LABEL },
    ...COMMUNITY_PROJECT_CATEGORY_DEFINITIONS.map((categoryDefinition) => ({
        key: categoryDefinition.key as string | null,
        label: categoryDefinition.label,
    })),
];

type CommunityProjectsPanelProps = {
    /**
     * The name the community already knows this member by, under which their project is shared
     */
    readonly memberFullname: string;
};

/**
 * The place where members show each other what they built
 *
 * Note: The projects are mock data kept in the browser, so nothing shared here is written anywhere yet. The panel
 *       itself asks only for the name of the member, which is what a stored project would be shared under as well.
 */
export function CommunityProjectsPanel({ memberFullname }: CommunityProjectsPanelProps) {
    const { shownProjects, sharedProjectCount, selectedCategoryKey, selectCategory, shareProject, toggleProjectLike } =
        useCommunityProjects(memberFullname);
    const [isShareFormOpen, setIsShareFormOpen] = useState(false);

    return (
        <section aria-labelledby="community-projects-title" className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 id="community-projects-title" className="flex items-center gap-2 text-lg font-bold text-white">
                        <Rocket className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" /> Projekty členů
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                        Ukažte ostatním, co jste postavili nebo vytvořili, a inspirujte se {sharedProjectCount} projekty
                        komunity.
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsShareFormOpen((isCurrentlyOpen) => !isCurrentlyOpen)}
                    aria-expanded={isShareFormOpen}
                    className="shrink-0 rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Sdílet projekt
                </Button>
            </div>

            {isShareFormOpen && (
                <CommunityProjectShareForm
                    authorFullname={memberFullname}
                    onShare={(draft) => {
                        shareProject(draft);
                        setIsShareFormOpen(false);
                        selectCategory(null);
                    }}
                    onCancel={() => setIsShareFormOpen(false)}
                />
            )}

            <div className="mt-4">
                <CommunityProjectCategoryChips<string | null>
                    label="Filtr projektů podle kategorie"
                    choices={COMMUNITY_PROJECT_FILTER_CHOICES}
                    selectedKey={selectedCategoryKey}
                    onSelect={selectCategory}
                />
            </div>

            {shownProjects.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-5 text-sm text-slate-400">
                    V této kategorii zatím nikdo nic nesdílel. Můžete být první.
                </p>
            ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {shownProjects.map((project) => (
                        <li key={project.id} className="min-w-0">
                            <CommunityProjectCard project={project} onToggleLike={toggleProjectLike} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
