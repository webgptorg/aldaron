'use client';

import { formatCountdownNumber, getCountdownParts } from '@/lib/workshop/countdown';

type WorkshopCountdownProps = {
    /**
     * Moment the workshop starts
     */
    readonly targetTime: Date;

    /**
     * Current moment measured on the clock of the server, `null` until the page really runs in the browser
     */
    readonly currentTime: Date | null;
};

/**
 * Numbers of the countdown, in the order they are shown in
 */
const COUNTDOWN_PART_LABELS = [
    { key: 'days', label: 'dní' },
    { key: 'hours', label: 'hodin' },
    { key: 'minutes', label: 'minut' },
    { key: 'seconds', label: 'sekund' },
] as const;

/**
 * How much time is left until the workshop starts
 *
 * Note: The days are left out once there are none, so the last hour before the start is not spent looking at a zero.
 */
export function WorkshopCountdown({ targetTime, currentTime }: WorkshopCountdownProps) {
    const countdownParts = currentTime === null ? null : getCountdownParts(targetTime, currentTime);
    const isDaysShown = countdownParts === null || countdownParts.days > 0;

    return (
        <div className="flex flex-wrap items-start gap-3 sm:gap-4">
            {COUNTDOWN_PART_LABELS.filter((part) => part.key !== 'days' || isDaysShown).map((part) => (
                <div
                    key={part.key}
                    className="min-w-[4.5rem] rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 text-center backdrop-blur-sm sm:min-w-[5.5rem] sm:px-5 sm:py-4"
                >
                    <div className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
                        {countdownParts === null ? '--' : formatCountdownNumber(countdownParts[part.key])}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/50">{part.label}</div>
                </div>
            ))}
        </div>
    );
}
