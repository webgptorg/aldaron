'use client';

import type { WorkshopCreateValues } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/businesses/workshop-admin/workshopAdminDateTime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type CreateWorkshopFormProps = {
    readonly onCreate: (values: WorkshopCreateValues) => Promise<boolean>;
};

const DEFAULT_WORKSHOP_DURATION_MILLISECONDS = 90 * 60 * 1000;
const DEFAULT_REACTIONS = '👍 ❤️ 👏 🔥 💡 😂';

export function CreateWorkshopForm({ onCreate }: CreateWorkshopFormProps) {
    const defaultStart = Date.now() + 24 * 60 * 60 * 1000;
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [startsAt, setStartsAt] = useState(() => toDateTimeLocalValue(new Date(defaultStart).toISOString()));
    const [endsAt, setEndsAt] = useState(() =>
        toDateTimeLocalValue(new Date(defaultStart + DEFAULT_WORKSHOP_DURATION_MILLISECONDS).toISOString()),
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const startsAtIso = fromDateTimeLocalValue(startsAt);
        const endsAtIso = fromDateTimeLocalValue(endsAt);
        if (!startsAtIso || !title.trim() || !slug.trim()) {
            return;
        }

        setIsSaving(true);
        const isCreated = await onCreate({
            slug,
            title,
            description: '',
            startsAt: startsAtIso,
            endsAt: endsAtIso,
            youtubeVideoId: null,
            isPublished: false,
            allowedReactions: DEFAULT_REACTIONS.split(' '),

            // A new workshop offers every panel of the room, the administration switches them off one by one.
            disabledPanels: [],
        });
        setIsSaving(false);
        if (isCreated) {
            setSlug('');
            setTitle('');
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <Button type="button" variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nový workshop
            </Button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Nový workshop</h3>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-900"
                    aria-label="Zavřít"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Název" required />
            <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="slug-workshopu"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
            />
            <label className="block text-xs font-medium text-slate-600">
                Začátek
                <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    className="mt-1"
                    required
                />
            </label>
            <label className="block text-xs font-medium text-slate-600">
                Konec
                <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                    className="mt-1"
                />
            </label>
            <Button type="submit" size="sm" className="w-full" disabled={isSaving}>
                {isSaving ? 'Vytvářím…' : 'Vytvořit'}
            </Button>
        </form>
    );
}
