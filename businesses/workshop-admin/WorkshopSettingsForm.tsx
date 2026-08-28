'use client';

import {
    createWorkshopEventWriteValues,
    type WorkshopWriteValues,
} from '@/businesses/workshop-admin/workshopAdminApiClient';
import { WorkshopEventFields } from '@/businesses/workshop-admin/WorkshopEventFields';
import { WorkshopPanelSettings } from '@/businesses/workshop-admin/WorkshopPanelSettings';
import { WorkshopReactionAnimationPreview } from '@/businesses/workshop-admin/WorkshopReactionAnimationPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/dateTimeLocal';
import { DEFAULT_EVENT_DETAILS } from '@/lib/events/event';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import { isWorkshopPanelOfferedByKind } from '@/lib/workshops/workshopPanels';
import { getWorkshopPhase, isWorkshopEndOpen } from '@/lib/workshops/workshopPhase';
import type { WorkshopDetails } from '@/lib/workshops/workshopTypes';
import { Save, Square } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

/**
 * Which of the two ways of saving the room is running, so each button says what it is doing
 */
type WorkshopSettingsSave = 'settings' | 'end';

const END_WORKSHOP_CONFIRMATION =
    'Opravdu workshop ukončit? Účastníkům se místo streamu okamžitě zobrazí závěrečné shrnutí.';

/**
 * What an empty end means, said where an administrator decides it
 */
const OPEN_WORKSHOP_END_HINT = 'Bez konce workshop běží dál a stream zůstává na scéně, dokud ho neukončíte.';

type WorkshopSettingsFormProps = {
    readonly workshop: WorkshopDetails;
    readonly onSave: (values: WorkshopWriteValues) => Promise<boolean>;
    readonly subjectLabel?: string;
};

/**
 * The reactions an admin wrote into one line
 *
 * Note: The preview and the save read the very same line the very same way, so what an admin previews is exactly what
 *       the room offers afterwards.
 */
function parseWorkshopReactions(reactionText: string): readonly string[] {
    return reactionText.trim().split(/\s+/).filter(Boolean);
}

export function WorkshopSettingsForm({ workshop, onSave, subjectLabel = 'workshopu' }: WorkshopSettingsFormProps) {
    const roomCapabilities = getWorkshopKindCapabilities(workshop.kind);
    // Note: The only room of its kind was given its address once and for all, so its administration does not ask for
    //       one at all rather than showing a field which cannot be used for anything.
    const isSlugOffered = !roomCapabilities.isSlugFixed;
    const isReactionSettingOffered = isWorkshopPanelOfferedByKind(workshop.kind, 'reactions');
    const [slug, setSlug] = useState(workshop.slug);
    const [title, setTitle] = useState(workshop.title);
    const [description, setDescription] = useState(workshop.description);
    const [startsAt, setStartsAt] = useState(() => toDateTimeLocalValue(workshop.startsAt));
    const [endsAt, setEndsAt] = useState(() => toDateTimeLocalValue(workshop.endsAt));
    const [eventDetails, setEventDetails] = useState(() => workshop.event ?? DEFAULT_EVENT_DETAILS);
    const [youtubeVideoId, setYoutubeVideoId] = useState(workshop.youtubeVideoId ?? '');
    const [reactionText, setReactionText] = useState(workshop.allowedReactions.join(' '));
    const [disabledPanels, setDisabledPanels] = useState(workshop.disabledPanels);
    const [isPublished, setIsPublished] = useState(workshop.isPublished);

    // Note: Both the settings and the ending of a workshop are one and the same save, so the form says which of them
    //       is running rather than letting a second one start beside it.
    const [runningSave, setRunningSave] = useState<WorkshopSettingsSave | null>(null);
    const isSaving = runningSave !== null;

    // Note: A workshop is ended by writing the end it does not have yet, which only a workshop already running can be
    //       asked for - ending one which has not started would place its end before its start.
    const isWorkshopEndable =
        roomCapabilities.isScheduled && isWorkshopEndOpen(workshop) && getWorkshopPhase(workshop) === 'ongoing';

    useEffect(() => {
        setSlug(workshop.slug);
        setTitle(workshop.title);
        setDescription(workshop.description);
        setStartsAt(toDateTimeLocalValue(workshop.startsAt));
        setEndsAt(toDateTimeLocalValue(workshop.endsAt));
        setEventDetails(workshop.event ?? DEFAULT_EVENT_DETAILS);
        setYoutubeVideoId(workshop.youtubeVideoId ?? '');
        setReactionText(workshop.allowedReactions.join(' '));
        setDisabledPanels(workshop.disabledPanels);
        setIsPublished(workshop.isPublished);
    }, [workshop]);

    /**
     * Saves everything the form holds, with the end it is told to write
     *
     * Note: Ending a workshop is nothing but this very save with the current moment as its end, so both ways of
     *       writing an end reach the room through the same request.
     */
    const saveWorkshop = async (save: WorkshopSettingsSave, endsAtIso: string | null) => {
        const startsAtIso = fromDateTimeLocalValue(startsAt);
        if (!title.trim() || (isSlugOffered && !slug.trim()) || (roomCapabilities.isScheduled && !startsAtIso)) {
            return;
        }

        setRunningSave(save);
        await onSave({
            title,
            description,
            isPublished,
            disabledPanels,
            ...(isSlugOffered ? { slug } : {}),
            ...(roomCapabilities.isScheduled && startsAtIso ? { startsAt: startsAtIso, endsAt: endsAtIso } : {}),
            ...(roomCapabilities.isEvent ? createWorkshopEventWriteValues(eventDetails) : {}),
            ...(roomCapabilities.isStageOffered ? { youtubeVideoId: youtubeVideoId.trim() || null } : {}),
            ...(isReactionSettingOffered ? { allowedReactions: parseWorkshopReactions(reactionText) } : {}),
        });
        setRunningSave(null);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void saveWorkshop('settings', fromDateTimeLocalValue(endsAt));
    };

    const handleEndWorkshopNow = () => {
        if (!window.confirm(END_WORKSHOP_CONFIRMATION)) {
            return;
        }

        void saveWorkshop('end', new Date().toISOString());
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">Nastavení {subjectLabel}</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        {isSlugOffered
                            ? 'URL místnosti a odkazů můžete upravit níže.'
                            : 'Adresa místnosti je stálá, ostatní nastavení můžete upravit níže.'}
                    </p>
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
                {isSlugOffered && (
                    <label className="text-sm font-medium text-slate-700 md:col-span-2">
                        URL slug
                        <Input
                            value={slug}
                            onChange={(event) => setSlug(event.target.value)}
                            className="mt-2 font-mono"
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            required
                        />
                        <span className="mt-1 block text-xs font-normal text-slate-400">
                            Používá se jako <code>?workshop={slug || 'slug-workshopu'}</code> v odkazu do místnosti.
                        </span>
                    </label>
                )}
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
                {roomCapabilities.isScheduled && (
                    <>
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
                        <div className="text-sm font-medium text-slate-700">
                            <label>
                                Konec
                                <Input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(event) => setEndsAt(event.target.value)}
                                    className="mt-2"
                                />
                            </label>
                            {endsAt === '' && (
                                <p className="mt-1 text-xs font-normal text-slate-400">{OPEN_WORKSHOP_END_HINT}</p>
                            )}
                            {isWorkshopEndable && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="mt-2"
                                    disabled={isSaving}
                                    onClick={handleEndWorkshopNow}
                                >
                                    <Square className="mr-2 h-4 w-4" />
                                    {runningSave === 'end' ? 'Ukončuji…' : 'Ukončit workshop'}
                                </Button>
                            )}
                        </div>
                    </>
                )}
                {roomCapabilities.isEvent && <WorkshopEventFields event={eventDetails} onChange={setEventDetails} />}
                {roomCapabilities.isStageOffered && (
                    <label className="text-sm font-medium text-slate-700">
                        YouTube URL nebo video ID
                        <Input
                            value={youtubeVideoId}
                            onChange={(event) => setYoutubeVideoId(event.target.value)}
                            className="mt-2 font-mono"
                            placeholder="https://youtube.com/live/…"
                        />
                    </label>
                )}
                {isReactionSettingOffered && (
                    <>
                        <label className="text-sm font-medium text-slate-700">
                            Reakce oddělené mezerou
                            <Input
                                value={reactionText}
                                onChange={(event) => setReactionText(event.target.value)}
                                className="mt-2"
                            />
                        </label>
                        <div className="md:col-span-2">
                            <WorkshopReactionAnimationPreview reactions={parseWorkshopReactions(reactionText)} />
                        </div>
                    </>
                )}
                <div className="md:col-span-2">
                    <WorkshopPanelSettings
                        workshopKind={workshop.kind}
                        disabledPanels={disabledPanels}
                        onChange={setDisabledPanels}
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {runningSave === 'settings' ? 'Ukládám…' : 'Uložit nastavení'}
                </Button>
            </div>
        </form>
    );
}
