'use client';

import Image from 'next/image';
import Link from 'next/link';

const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png';

type WorkshopRoomHeaderProps = {
    /**
     * Name of the participant who is watching, `null` before anybody filled it in
     */
    readonly participantName: string | null;

    readonly onChangeParticipantName: () => void;
};

/**
 * Slim bar of the workshop room
 *
 * Note: The page is dark and is meant to be watched, so the header stays out of the way and only says who is
 *       connected.
 */
export function WorkshopRoomHeader({ participantName, onChangeParticipantName }: WorkshopRoomHeaderProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto flex items-center gap-4 px-4 py-3">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image src={promptbookLogo} alt="Promptbook" width={32} height={32} className="h-8 w-8" />
                    <span className="text-lg text-white">
                        Prompt<b>book</b>
                    </span>
                </Link>

                {participantName !== null && (
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden text-sm text-white/60 sm:inline">
                            Připojen jako <strong className="font-semibold text-white">{participantName}</strong>
                        </span>
                        <button
                            type="button"
                            onClick={onChangeParticipantName}
                            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
                        >
                            Změnit jméno
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
