'use client';

import { Button } from '@/components/ui/button';
import { Square } from 'lucide-react';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;

const END_WORKSHOP_CONFIRMATION =
    'Opravdu workshop ukončit? Účastníkům se místo streamu okamžitě zobrazí závěrečné shrnutí.';
const OPEN_WORKSHOP_END_CONFIRMATION =
    'Opravdu nechat workshop bez konce? Účastníkům se znovu zobrazí stream, dokud workshop znovu neukončíte.';

/**
 * What an empty end means, said where an administrator decides it
 */
const OPEN_WORKSHOP_END_HINT = 'Bez konce workshop běží dál a stream zůstává na scéně, dokud ho neukončíte.';

export type WorkshopEndSaveAction =
    | 'end-now'
    | 'open-end'
    | 'end-one-hour-after-start'
    | 'end-two-hours-after-start';

type WorkshopEndPreset = {
    readonly saveAction: Extract<
        WorkshopEndSaveAction,
        'end-one-hour-after-start' | 'end-two-hours-after-start'
    >;
    readonly durationHours: number;
    readonly label: string;
};

const WORKSHOP_END_PRESETS: readonly WorkshopEndPreset[] = [
    {
        saveAction: 'end-one-hour-after-start',
        durationHours: 1,
        label: 'Nastavit konec 1 hodinu po začátku',
    },
    {
        saveAction: 'end-two-hours-after-start',
        durationHours: 2,
        label: 'Nastavit konec 2 hodiny po začátku',
    },
];

type WorkshopEndControlsProps = {
    readonly startsAt: string | null;
    readonly isEndOpen: boolean;
    readonly isWorkshopEndableNow: boolean;
    readonly isSaving: boolean;
    readonly runningSaveAction: WorkshopEndSaveAction | null;
    readonly onSaveEnd: (saveAction: WorkshopEndSaveAction, endsAt: string | null) => void;
};

/**
 * Gets a recorded workshop end from one of the small duration presets.
 *
 * Note: The preset is calculated from the very start which the form will save, so changing a workshop's start and
 *       choosing its usual duration cannot leave the two timestamps out of step.
 */
function getWorkshopEndAfterStart(startsAt: string, durationHours: number): string {
    return new Date(Date.parse(startsAt) + durationHours * MILLISECONDS_PER_HOUR).toISOString();
}

/**
 * The quick choices beside a scheduled workshop's end field
 *
 * Note: Every choice uses the settings form's one save path. It consequently follows the same validation, reload,
 *       and live-room update as an end an administrator types by hand.
 */
export function WorkshopEndControls({
    startsAt,
    isEndOpen,
    isWorkshopEndableNow,
    isSaving,
    runningSaveAction,
    onSaveEnd,
}: WorkshopEndControlsProps) {
    const isStartKnown = startsAt !== null;

    if (!isEndOpen) {
        return (
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                disabled={isSaving}
                onClick={() => {
                    if (window.confirm(OPEN_WORKSHOP_END_CONFIRMATION)) {
                        onSaveEnd('open-end', null);
                    }
                }}
            >
                {runningSaveAction === 'open-end' ? 'Otevírám konec…' : 'Nechat workshop bez konce'}
            </Button>
        );
    }

    return (
        <div className="mt-2 space-y-2">
            <p className="text-xs font-normal text-slate-400">{OPEN_WORKSHOP_END_HINT}</p>
            <div className="flex flex-wrap gap-2">
                {isWorkshopEndableNow && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => {
                            if (window.confirm(END_WORKSHOP_CONFIRMATION)) {
                                onSaveEnd('end-now', new Date().toISOString());
                            }
                        }}
                    >
                        <Square className="mr-2 h-4 w-4" />
                        {runningSaveAction === 'end-now' ? 'Ukončuji…' : 'Ukončit workshop'}
                    </Button>
                )}
                {WORKSHOP_END_PRESETS.map((preset) => (
                    <Button
                        key={preset.saveAction}
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isSaving || !isStartKnown}
                        onClick={() => {
                            if (startsAt !== null) {
                                onSaveEnd(
                                    preset.saveAction,
                                    getWorkshopEndAfterStart(startsAt, preset.durationHours),
                                );
                            }
                        }}
                    >
                        {runningSaveAction === preset.saveAction ? 'Nastavuji…' : preset.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
