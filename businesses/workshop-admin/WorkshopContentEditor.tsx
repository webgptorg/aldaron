'use client';

import type { WorkshopContentWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/businesses/workshop-admin/workshopAdminDateTime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WorkshopContentBlock } from '@/lib/workshops/workshopTypes';
import { Save, Trash2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

type WorkshopContentEditorProps = {
    readonly contentBlock: WorkshopContentBlock | null;
    readonly defaultUnlockAt: string;
    readonly defaultSortOrder: number;
    readonly onSave: (values: WorkshopContentWriteValues) => Promise<boolean>;
    readonly onDelete?: () => Promise<void>;
};

export function WorkshopContentEditor({
    contentBlock,
    defaultUnlockAt,
    defaultSortOrder,
    onSave,
    onDelete,
}: WorkshopContentEditorProps) {
    const [title, setTitle] = useState(contentBlock?.title ?? '');
    const [bodyMarkdown, setBodyMarkdown] = useState(contentBlock?.bodyMarkdown ?? '');
    const [unlockAt, setUnlockAt] = useState(() => toDateTimeLocalValue(contentBlock?.unlockAt ?? defaultUnlockAt));
    const [sortOrder, setSortOrder] = useState(contentBlock?.sortOrder ?? defaultSortOrder);
    const [isPublished, setIsPublished] = useState(contentBlock?.isPublished ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setTitle(contentBlock?.title ?? '');
        setBodyMarkdown(contentBlock?.bodyMarkdown ?? '');
        setUnlockAt(toDateTimeLocalValue(contentBlock?.unlockAt ?? defaultUnlockAt));
        setSortOrder(contentBlock?.sortOrder ?? defaultSortOrder);
        setIsPublished(contentBlock?.isPublished ?? true);
    }, [contentBlock, defaultSortOrder, defaultUnlockAt]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const unlockAtIso = fromDateTimeLocalValue(unlockAt);
        if (!unlockAtIso || !bodyMarkdown.trim()) {
            return;
        }

        setIsSaving(true);
        const isSaved = await onSave({ title, bodyMarkdown, unlockAt: unlockAtIso, sortOrder, isPublished });
        setIsSaving(false);
        if (isSaved && contentBlock === null) {
            setTitle('');
            setBodyMarkdown('');
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !window.confirm('Opravdu tento obsah odstranit? Účastníkům okamžitě zmizí.')) {
            return;
        }
        setIsDeleting(true);
        await onDelete();
        setIsDeleting(false);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`rounded-xl border p-5 ${contentBlock === null ? 'border-dashed border-cyan-300 bg-cyan-50/40' : 'border-slate-200 bg-slate-50/70'}`}
        >
            <div className="grid gap-4 md:grid-cols-[1fr_190px_100px_auto]">
                <label className="text-xs font-medium text-slate-600">
                    Nadpis
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        className="mt-1 bg-white"
                        placeholder="Volitelný nadpis"
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Odemknout
                    <Input
                        type="datetime-local"
                        value={unlockAt}
                        onChange={(event) => setUnlockAt(event.target.value)}
                        className="mt-1 bg-white"
                        required
                    />
                </label>
                <label className="text-xs font-medium text-slate-600">
                    Pořadí
                    <Input
                        type="number"
                        value={sortOrder}
                        onChange={(event) => setSortOrder(Number(event.target.value))}
                        className="mt-1 bg-white"
                    />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(event) => setIsPublished(event.target.checked)}
                    />{' '}
                    Publikovat
                </label>
            </div>
            <label className="mt-4 block text-xs font-medium text-slate-600">
                Markdown
                <Textarea
                    value={bodyMarkdown}
                    onChange={(event) => setBodyMarkdown(event.target.value)}
                    className="mt-1 min-h-40 bg-white font-mono text-xs"
                    placeholder={'## Materiály\n\n- [Odkaz](https://...)'}
                    required
                />
            </label>
            <div className="mt-4 flex justify-end gap-2">
                {onDelete && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Mažu…' : 'Smazat'}
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Ukládám…' : contentBlock === null ? 'Přidat obsah' : 'Uložit'}
                </Button>
            </div>
        </form>
    );
}
