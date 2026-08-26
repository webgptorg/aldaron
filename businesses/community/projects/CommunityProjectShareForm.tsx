'use client';

import { CommunityProjectCategoryChips } from '@/businesses/community/projects/CommunityProjectCategoryChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    COMMUNITY_PROJECT_CATEGORY_DEFINITIONS,
    type CommunityProjectCategoryKey,
} from '@/lib/community/communityProjectCategories';
import type { CommunityProjectDraft } from '@/lib/community/communityProjectTypes';
import {
    EMPTY_COMMUNITY_PROJECT_DRAFT,
    getCommunityProjectDraftErrorMessage,
    MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH,
    MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH,
    normalizeCommunityProjectDraft,
} from '@/lib/community/communityProjectValues';
import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const COMMUNITY_PROJECT_CATEGORY_CHOICES = COMMUNITY_PROJECT_CATEGORY_DEFINITIONS.map((categoryDefinition) => ({
    key: categoryDefinition.key,
    label: categoryDefinition.label,
}));

const FIELD_CLASS_NAME =
    'border-white/10 bg-white/[0.04] text-sm text-white placeholder:text-slate-600 focus-visible:ring-cyan-300/50';

type CommunityProjectShareFormProps = {
    readonly authorFullname: string;
    readonly onShare: (draft: CommunityProjectDraft) => void;
    readonly onCancel: () => void;
};

/**
 * The form which shares a project with the community
 *
 * Note: It refuses exactly what the shared rule refuses and says why, so a member learns what is missing instead of
 *       pressing a button which does nothing.
 */
export function CommunityProjectShareForm({ authorFullname, onShare, onCancel }: CommunityProjectShareFormProps) {
    const [draft, setDraft] = useState<CommunityProjectDraft>(EMPTY_COMMUNITY_PROJECT_DRAFT);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const changeDraft = (values: Partial<CommunityProjectDraft>) => {
        setDraft((currentDraft) => ({ ...currentDraft, ...values }));
        setErrorMessage(null);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const draftErrorMessage = getCommunityProjectDraftErrorMessage(draft);
        if (draftErrorMessage !== null) {
            setErrorMessage(draftErrorMessage);
            return;
        }

        onShare(normalizeCommunityProjectDraft(draft));
        setDraft(EMPTY_COMMUNITY_PROJECT_DRAFT);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-200">
                    Název projektu
                    <Input
                        value={draft.title}
                        onChange={(event) => changeDraft({ title: event.target.value })}
                        maxLength={MAXIMAL_COMMUNITY_PROJECT_TITLE_LENGTH}
                        placeholder="Například Generátor nabídek z e-mailu"
                        className={`mt-2 font-normal ${FIELD_CLASS_NAME}`}
                    />
                </label>
                <label className="text-sm font-semibold text-slate-200">
                    Odkaz na projekt
                    <Input
                        value={draft.url}
                        onChange={(event) => changeDraft({ url: event.target.value })}
                        inputMode="url"
                        placeholder="https://…"
                        className={`mt-2 font-normal ${FIELD_CLASS_NAME}`}
                    />
                </label>
                <label className="text-sm font-semibold text-slate-200 sm:col-span-2">
                    Co jste vytvořili
                    <Textarea
                        value={draft.description}
                        onChange={(event) => changeDraft({ description: event.target.value })}
                        maxLength={MAXIMAL_COMMUNITY_PROJECT_DESCRIPTION_LENGTH}
                        placeholder="Napište, k čemu projekt slouží, co vám na něm pomohla AI a s čím byste uvítali zpětnou vazbu."
                        className={`mt-2 min-h-24 resize-none font-normal ${FIELD_CLASS_NAME}`}
                    />
                </label>
            </div>

            <div className="mt-4">
                <p className="text-sm font-semibold text-slate-200">Kategorie</p>
                <div className="mt-2">
                    <CommunityProjectCategoryChips<CommunityProjectCategoryKey>
                        label="Kategorie projektu"
                        choices={COMMUNITY_PROJECT_CATEGORY_CHOICES}
                        selectedKey={draft.categoryKey}
                        onSelect={(categoryKey) => changeDraft({ categoryKey })}
                    />
                </div>
            </div>

            {errorMessage !== null && (
                <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm text-rose-200">
                    {errorMessage}
                </p>
            )}

            <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-5 text-slate-600">
                    Projekt se zobrazí pod jménem {authorFullname}. Ukázkové sdílení zatím zůstává jen ve vašem
                    prohlížeči.
                </p>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onCancel}
                        className="rounded-full text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    >
                        Zrušit
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="w-full rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200 sm:w-auto"
                    >
                        <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Publikovat projekt
                    </Button>
                </div>
            </div>
        </form>
    );
}
