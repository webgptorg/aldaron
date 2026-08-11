'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAXIMAL_PARTICIPANT_NAME_LENGTH } from '@/lib/workshop/workshopConfig';
import { ArrowRight, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type WorkshopJoinFormProps = {
    readonly onJoin: (participantName: string) => void;
};

/**
 * The one thing a participant has to do before entering the workshop room
 *
 * Note: There is no password and no account, the name is only what the others see next to the messages in the chat.
 */
export function WorkshopJoinForm({ onJoin }: WorkshopJoinFormProps) {
    const [participantName, setParticipantName] = useState('');
    const [isNameMissingShown, setIsNameMissingShown] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (participantName.trim() === '') {
            setIsNameMissingShown(true);
            return;
        }

        onJoin(participantName);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-xl sm:p-8"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400/15">
                    <Users className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Připoj se k workshopu</h2>
                    <p className="text-sm text-white/60">Napiš, jak ti máme říkat v chatu.</p>
                </div>
            </div>

            <label htmlFor="workshop-participant-name" className="mt-6 block text-sm font-semibold text-white/80">
                Tvoje jméno
            </label>
            <Input
                id="workshop-participant-name"
                name="participantName"
                value={participantName}
                onChange={(event) => {
                    setParticipantName(event.target.value);
                    setIsNameMissingShown(false);
                }}
                placeholder="Jana Nováková"
                autoComplete="name"
                autoFocus
                maxLength={MAXIMAL_PARTICIPANT_NAME_LENGTH}
                aria-invalid={isNameMissingShown}
                className="mt-2 h-12 border-white/20 bg-white/10 text-white placeholder:text-white/35 focus-visible:ring-cyan-300"
            />

            {isNameMissingShown && <p className="mt-2 text-xs text-red-300">Bez jména se do workshopu nedostaneš.</p>}

            <Button
                type="submit"
                className="mt-5 h-12 w-full rounded-full bg-promptbook-blue-dark text-base font-semibold text-white hover:bg-promptbook-blue-dark/90"
            >
                Vstoupit do workshopu
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="mt-4 text-center text-xs leading-relaxed text-white/45">
                Jméno se ukládá jen v tvém prohlížeči a vidí ho ostatní u tvých zpráv v chatu.
            </p>
        </form>
    );
}
