'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fromDateTimeLocalInputValue } from '@/lib/workshop/dateTimeLocalInput';
import type { WorkshopContentBlockDraft } from '@/lib/workshop/workshopTypes';
import { useState, type FormEvent } from 'react';

type AddContentBlockFormProps = {
    /**
     * Position the new block gets, so that it lands at the end of the current ones
     */
    readonly nextSortOrder: number;

    readonly onAddContentBlock: (contentBlockDraft: WorkshopContentBlockDraft) => Promise<boolean>;
};

/**
 * Writing one new piece of the workshop content
 *
 * Note: A block added without a moment stays a draft, which is the safe way to prepare the materials up front.
 */
export function AddContentBlockForm({ nextSortOrder, onAddContentBlock }: AddContentBlockFormProps) {
    const [title, setTitle] = useState('');
    const [contentMarkdown, setContentMarkdown] = useState('');
    const [unlockedAtInputValue, setUnlockedAtInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (title.trim() === '') {
            return;
        }

        setIsAdding(true);

        const isAdded = await onAddContentBlock({
            title,
            contentMarkdown,
            unlockedAt: fromDateTimeLocalInputValue(unlockedAtInputValue),
            sortOrder: nextSortOrder,
        });

        setIsAdding(false);

        if (isAdded) {
            setTitle('');
            setContentMarkdown('');
            setUnlockedAtInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5">
            <h3 className="text-base font-bold">Add a content block</h3>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Title</span>
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Repository from the demo"
                        className="mt-1.5 bg-white"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Unlocks at (empty means a draft)</span>
                    <Input
                        type="datetime-local"
                        value={unlockedAtInputValue}
                        onChange={(event) => setUnlockedAtInputValue(event.target.value)}
                        className="mt-1.5 bg-white"
                    />
                </label>
            </div>

            <label className="mt-4 block">
                <span className="text-sm font-semibold text-gray-700">Content in Markdown</span>
                <Textarea
                    value={contentMarkdown}
                    onChange={(event) => setContentMarkdown(event.target.value)}
                    rows={6}
                    placeholder={'## Links from the workshop\n\n- [Promptbook](https://ptbk.io)'}
                    className="mt-1.5 bg-white font-mono text-sm"
                />
            </label>

            <Button type="submit" className="mt-4" disabled={isAdding || title.trim() === ''}>
                {isAdding ? 'Adding...' : 'Add block'}
            </Button>
        </form>
    );
}
