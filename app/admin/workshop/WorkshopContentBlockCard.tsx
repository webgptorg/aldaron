'use client';

import { getContentBlockStatus } from '@/app/admin/workshop/contentBlockStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fromDateTimeLocalInputValue, toDateTimeLocalInputValue } from '@/lib/workshop/dateTimeLocalInput';
import type { WorkshopContentBlock, WorkshopContentBlockChanges } from '@/lib/workshop/workshopTypes';
import { useEffect, useState } from 'react';

type WorkshopContentBlockCardProps = {
    readonly contentBlock: WorkshopContentBlock;
    readonly onChangeContentBlock: (contentBlockChanges: WorkshopContentBlockChanges) => Promise<boolean>;
    readonly onRemoveContentBlock: () => Promise<boolean>;
};

/**
 * One piece of the workshop content with the moment it is revealed at
 *
 * Note: Unlocking is one click, because during a live workshop there is no time to fill in a date.
 */
export function WorkshopContentBlockCard({
    contentBlock,
    onChangeContentBlock,
    onRemoveContentBlock,
}: WorkshopContentBlockCardProps) {
    const [title, setTitle] = useState(contentBlock.title);
    const [contentMarkdown, setContentMarkdown] = useState(contentBlock.contentMarkdown);
    const [unlockedAtInputValue, setUnlockedAtInputValue] = useState(
        toDateTimeLocalInputValue(contentBlock.unlockedAt),
    );
    const [sortOrder, setSortOrder] = useState(String(contentBlock.sortOrder));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(contentBlock.title);
        setContentMarkdown(contentBlock.contentMarkdown);
        setUnlockedAtInputValue(toDateTimeLocalInputValue(contentBlock.unlockedAt));
        setSortOrder(String(contentBlock.sortOrder));
    }, [contentBlock]);

    const status = getContentBlockStatus(contentBlock, new Date());

    const saveContentBlock = async (contentBlockChanges: WorkshopContentBlockChanges) => {
        setIsSaving(true);
        await onChangeContentBlock(contentBlockChanges);
        setIsSaving(false);
    };

    const handleSaveClick = () =>
        saveContentBlock({
            title,
            contentMarkdown,
            unlockedAt: fromDateTimeLocalInputValue(unlockedAtInputValue),
            sortOrder: Number(sortOrder) || 0,
        });

    const handleDeleteClick = async () => {
        if (!window.confirm(`Delete the block "${contentBlock.title}" for everybody who is connected?`)) {
            return;
        }

        setIsSaving(true);
        await onRemoveContentBlock();
        setIsSaving(false);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClassName}`}>
                    {status.label}
                </span>
                <span className="text-xs text-gray-400">#{contentBlock.id}</span>

                <div className="ml-auto flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => saveContentBlock({ unlockedAt: new Date().toISOString() })}
                    >
                        Unlock now
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving || contentBlock.unlockedAt === null}
                        onClick={() => saveContentBlock({ unlockedAt: null })}
                    >
                        Lock again
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_6rem]">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Title</span>
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5" />
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Unlocks at</span>
                    <Input
                        type="datetime-local"
                        value={unlockedAtInputValue}
                        onChange={(event) => setUnlockedAtInputValue(event.target.value)}
                        className="mt-1.5"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Order</span>
                    <Input
                        type="number"
                        value={sortOrder}
                        onChange={(event) => setSortOrder(event.target.value)}
                        className="mt-1.5"
                    />
                </label>
            </div>

            <label className="mt-4 block">
                <span className="text-sm font-semibold text-gray-700">Content in Markdown</span>
                <Textarea
                    value={contentMarkdown}
                    onChange={(event) => setContentMarkdown(event.target.value)}
                    rows={8}
                    className="mt-1.5 font-mono text-sm"
                />
            </label>

            <div className="mt-4 flex items-center gap-2">
                <Button type="button" disabled={isSaving} onClick={handleSaveClick}>
                    {isSaving ? 'Saving...' : 'Save block'}
                </Button>
                <div className="grow" />
                <Button type="button" variant="ghost" disabled={isSaving} onClick={handleDeleteClick}>
                    Delete
                </Button>
            </div>
        </div>
    );
}
