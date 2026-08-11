'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fromDateTimeLocalInputValue, toDateTimeLocalInputValue } from '@/lib/workshop/dateTimeLocalInput';
import type { WorkshopSettings, WorkshopSettingsChanges } from '@/lib/workshop/workshopTypes';
import { extractYoutubeVideoId } from '@/lib/workshop/youtubeEmbed';
import { useEffect, useState, type FormEvent } from 'react';

type WorkshopSettingsFormProps = {
    readonly settings: WorkshopSettings;
    readonly onSaveSettings: (settingsChanges: WorkshopSettingsChanges) => Promise<boolean>;
};

/**
 * The settings which decide when the countdown ends and what the participants watch
 */
export function WorkshopSettingsForm({ settings, onSaveSettings }: WorkshopSettingsFormProps) {
    const [title, setTitle] = useState(settings.title);
    const [startsAtInputValue, setStartsAtInputValue] = useState(toDateTimeLocalInputValue(settings.startsAt));
    const [youtubeVideo, setYoutubeVideo] = useState(settings.youtubeVideoId || '');
    const [streamNote, setStreamNote] = useState(settings.streamNote || '');
    const [isStreamLive, setIsStreamLive] = useState(settings.isStreamLive);
    const [isChatEnabled, setIsChatEnabled] = useState(settings.isChatEnabled);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Note: The form is filled in again whenever the answer of the server changes, for example after the first save
    //       created the row of the workshop
    useEffect(() => {
        setTitle(settings.title);
        setStartsAtInputValue(toDateTimeLocalInputValue(settings.startsAt));
        setYoutubeVideo(settings.youtubeVideoId || '');
        setStreamNote(settings.streamNote || '');
        setIsStreamLive(settings.isStreamLive);
        setIsChatEnabled(settings.isChatEnabled);
    }, [settings]);

    const recognizedYoutubeVideoId = extractYoutubeVideoId(youtubeVideo);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSaving(true);
        setIsSaved(false);

        const isSavedNow = await onSaveSettings({
            title,
            startsAt: fromDateTimeLocalInputValue(startsAtInputValue) || settings.startsAt,
            youtubeVideoId: youtubeVideo.trim() === '' ? null : youtubeVideo,
            streamNote,
            isStreamLive,
            isChatEnabled,
        });

        setIsSaving(false);
        setIsSaved(isSavedNow);
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold">Workshop settings</h2>
            <p className="mt-1 text-sm text-gray-500">
                The countdown of every participant runs to the start below, and the stream appears the moment it is
                reached.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Title</span>
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5" />
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Starts at</span>
                    <Input
                        type="datetime-local"
                        value={startsAtInputValue}
                        onChange={(event) => setStartsAtInputValue(event.target.value)}
                        className="mt-1.5"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">YouTube video or its link</span>
                    <Input
                        value={youtubeVideo}
                        onChange={(event) => setYoutubeVideo(event.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1.5"
                    />
                    <span className="mt-1 block text-xs text-gray-500">
                        {youtubeVideo.trim() === ''
                            ? 'Empty means the participants see "the stream is being prepared".'
                            : recognizedYoutubeVideoId === null
                              ? 'No YouTube video was recognized here, the participants would see nothing.'
                              : `Recognized video: ${recognizedYoutubeVideoId}`}
                    </span>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Note next to the stream</span>
                    <Input
                        value={streamNote}
                        onChange={(event) => setStreamNote(event.target.value)}
                        placeholder="We are starting a few minutes later"
                        className="mt-1.5"
                    />
                </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={isStreamLive}
                        onChange={(event) => setIsStreamLive(event.target.checked)}
                        className="h-4 w-4"
                    />
                    Show the stream already, whatever the countdown says
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={isChatEnabled}
                        onChange={(event) => setIsChatEnabled(event.target.checked)}
                        className="h-4 w-4"
                    />
                    Let the participants write into the chat
                </label>
            </div>

            <div className="mt-5 flex items-center gap-3">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save settings'}
                </Button>
                {isSaved && <span className="text-sm text-emerald-700">Saved</span>}
            </div>
        </form>
    );
}
