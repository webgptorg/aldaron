'use client';

import { cn } from '@/lib/utils';

/**
 * One choosable category, which is either a real category or the "everything" of a filter
 */
export type CommunityProjectCategoryChoice<TCategoryKey extends string | null> = {
    readonly key: TCategoryKey;
    readonly label: string;
};

type CommunityProjectCategoryChipsProps<TCategoryKey extends string | null> = {
    readonly label: string;
    readonly choices: readonly CommunityProjectCategoryChoice<TCategoryKey>[];
    readonly selectedKey: TCategoryKey;
    readonly onSelect: (categoryKey: TCategoryKey) => void;
};

/**
 * The one way a category is chosen in the community, used both to filter the shared projects and to say what a newly
 * shared project is, so both stay one tap on the same chips.
 */
export function CommunityProjectCategoryChips<TCategoryKey extends string | null>({
    label,
    choices,
    selectedKey,
    onSelect,
}: CommunityProjectCategoryChipsProps<TCategoryKey>) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap gap-2">
            {choices.map((choice) => {
                const isSelected = choice.key === selectedKey;

                return (
                    <button
                        key={choice.key ?? 'all'}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelect(choice.key)}
                        className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                            isSelected
                                ? 'border-cyan-300/70 bg-cyan-300/15 text-white'
                                : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-cyan-300/30 hover:text-slate-200',
                        )}
                    >
                        {choice.label}
                    </button>
                );
            })}
        </div>
    );
}
