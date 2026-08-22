'use client';

import { WORKSHOP_ROOM_BADGE_CLASS_NAME } from '@/businesses/online-workshop/participant/workshopRoomBadge';
import { Input } from '@/components/ui/input';
import { MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH } from '@/lib/workshops/workshopConstants';
import { isWorkshopParticipantFullnameValid } from '@/lib/workshops/workshopParticipantFullname';
import { Check, Pencil, Radio, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

type WorkshopParticipantBadgeProps = {
    /**
     * Name the participant is connected under, which is also the name shown at their comments
     */
    readonly fullname: string;

    /**
     * Whether this participant may not interact, which also freezes the name their comments were moderated under
     */
    readonly isInteractionBanned: boolean;

    /**
     * Whether this participant moderates the room, which the badge says next to their name
     */
    readonly isModerating: boolean;

    /**
     * Whether the room is loading a newer snapshot right now
     */
    readonly isRefreshing: boolean;

    /**
     * Stores the new name and resolves to whether it was accepted
     */
    readonly onChangeFullname: (fullname: string) => Promise<boolean>;
};

const BADGE_CLASS_NAME = `${WORKSHOP_ROOM_BADGE_CLASS_NAME} border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200`;
const BADGE_ACTION_CLASS_NAME =
    'shrink-0 rounded-full p-1.5 text-emerald-200/70 transition hover:bg-emerald-300/10 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Shows who the participant is connected as and lets them rename themselves without leaving the room
 */
export function WorkshopParticipantBadge({
    fullname,
    isInteractionBanned,
    isModerating,
    isRefreshing,
    onChangeFullname,
}: WorkshopParticipantBadgeProps) {
    // Note: A name being edited doubles as the flag that the rename form is open, so the two can never disagree.
    const [editedFullname, setEditedFullname] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const isEditedFullnameValid = editedFullname !== null && isWorkshopParticipantFullnameValid(editedFullname);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (editedFullname === null || !isEditedFullnameValid || isSaving) {
            return;
        }

        setIsSaving(true);
        const isChanged = await onChangeFullname(editedFullname);
        setIsSaving(false);
        if (isChanged) {
            setEditedFullname(null);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setEditedFullname(null);
        }
    };

    if (editedFullname === null) {
        return (
            <div className={`${BADGE_CLASS_NAME} py-1.5 pl-3 ${isInteractionBanned ? 'pr-3' : 'pr-1.5'}`}>
                <Radio className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 break-words text-center">Připojen/a jako {fullname}</span>
                {isModerating && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-300/10 px-2 py-0.5 text-[11px] font-semibold text-violet-200">
                        <ShieldCheck className="h-3 w-3" /> Moderátor
                    </span>
                )}
                {isRefreshing && <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-slate-500" />}
                {!isInteractionBanned && (
                    <button
                        type="button"
                        onClick={() => setEditedFullname(fullname)}
                        className={BADGE_ACTION_CLASS_NAME}
                        aria-label="Změnit jméno"
                        title="Změnit jméno"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`${BADGE_CLASS_NAME} w-full p-1 pl-3 sm:w-auto`}>
            <Radio className="h-3.5 w-3.5 shrink-0" />
            <Input
                value={editedFullname}
                onChange={(event) => setEditedFullname(event.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="name"
                maxLength={MAXIMAL_WORKSHOP_PARTICIPANT_FULLNAME_LENGTH}
                disabled={isSaving}
                placeholder="Jana Nováková"
                aria-label="Vaše jméno"
                aria-invalid={!isEditedFullnameValid}
                className="h-8 w-full min-w-0 rounded-full border-white/15 bg-white/5 px-3 text-xs text-white placeholder:text-slate-600 sm:w-56"
            />
            <button
                type="submit"
                disabled={isSaving || !isEditedFullnameValid}
                className={BADGE_ACTION_CLASS_NAME}
                aria-label="Uložit jméno"
                title="Uložit jméno"
            >
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </button>
            <button
                type="button"
                onClick={() => setEditedFullname(null)}
                disabled={isSaving}
                className={BADGE_ACTION_CLASS_NAME}
                aria-label="Zrušit změnu jména"
                title="Zrušit změnu jména"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </form>
    );
}
