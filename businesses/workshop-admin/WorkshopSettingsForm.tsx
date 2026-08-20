'use client';

import type { WorkshopWriteValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/businesses/workshop-admin/workshopAdminDateTime';
import { WorkshopPanelSettings } from '@/businesses/workshop-admin/WorkshopPanelSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

type WorkshopSettingsFormProps = {
    readonly workshop: WorkshopDetails;
    readonly onSave: (values: WorkshopWriteValues) => Promise<boolean>;
};

export function WorkshopSettingsForm({ workshop, onSave }: WorkshopSettingsFormProps) {
    const [title, setTitle] = useState(workshop.title);
    const [description, setDescription] = useState(workshop.description);
    const [startsAt, setStartsAt] = useState(() => toDateTimeLocalValue(workshop.startsAt));
    const [endsAt, setEndsAt] = useState(() => toDateTimeLocalValue(workshop.endsAt));
    const [youtubeVideoId, setYoutubeVideoId] = useState(workshop.youtubeVideoId ?? '');
    const [reactionText, setReactionText] = useState(workshop.allowedReactions.join(' '));
    const [disabledPanels, setDisabledPanels] = useState(workshop.disabledPanels);
    const [isPublished, setIsPublished] = useState(workshop.isPublished);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(workshop.title);
        setDescription(workshop.description);
        setStartsAt(toDateTimeLocalValue(workshop.startsAt));
        setEndsAt(toDateTimeLocalValue(workshop.endsAt));
        setYoutubeVideoId(workshop.youtubeVideoId ?? '');
        setReactionText(workshop.allowedReactions.join(' '));
        setDisabledPanels(workshop.disabledPanels);
        setIsPublished(workshop.isPublished);
    }, [workshop]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const startsAtIso = fromDateTimeLocalValue(startsAt);
        if (!startsAtIso) {
            return;
        }

        setIsSaving(true);
        await onSave({
            title,
            description,
            startsAt: startsAtIso,
            endsAt: fromDateTimeLocalValue(endsAt),
            youtubeVideoId: youtubeVideoId.trim() || null,
            isPublished,
            allowedReactions: reactionText.trim().split(/\s+/).filter(Boolean),
            disabledPanels,
        });
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Nastavení workshopu</h2>
                    <p className="mt-1 font-mono text-xs text-slate-400">{workshop.slug}</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(event) => setIsPublished(event.target.checked)}
                        className="h-4 w-4 rounded"
                    />{' '}
                    Publikovaný
                </label>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                    Název
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2" required />
                </label>
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                    Popis
                    <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        className="mt-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Začátek
                    <Input
                        type="datetime-local"
                        value={startsAt}
                        onChange={(event) => setStartsAt(event.target.value)}
                        className="mt-2"
                        required
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Konec
                    <Input
                        type="datetime-local"
                        value={endsAt}
                        onChange={(event) => setEndsAt(event.target.value)}
                        className="mt-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    YouTube URL nebo video ID
                    <Input
                        value={youtubeVideoId}
                        onChange={(event) => setYoutubeVideoId(event.target.value)}
                        className="mt-2 font-mono"
                        placeholder="https://youtube.com/live/…"
                    />
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Reakce oddělené mezerou
                    <Input
                        value={reactionText}
                        onChange={(event) => setReactionText(event.target.value)}
                        className="mt-2"
                    />
                </label>
                <div className="md:col-span-2">
                    <WorkshopPanelSettings disabledPanels={disabledPanels} onChange={setDisabledPanels} />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Ukládám…' : 'Uložit nastavení'}
                </Button>
            </div>
        </form>
    );
}
