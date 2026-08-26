import { formatCzechWorkshopShortDate } from '@/lib/workshops/workshopDate';
import type { WorkshopSummary } from '@/lib/workshops/workshopTypes';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

/**
 * How the same list of occurrences is drawn on the light administration and inside the dark participant room.
 */
const WORKSHOP_POLL_ATTACHED_WORKSHOP_STYLES = {
    light: 'border-cyan-200 bg-cyan-50 text-cyan-900 hover:border-cyan-300 hover:bg-cyan-100',
    dark: 'border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-100 hover:border-cyan-200/60 hover:bg-cyan-300/[0.16]',
} as const;

type WorkshopPollAttachedWorkshopsProps = {
    readonly workshops: readonly WorkshopSummary[];
    readonly variant?: keyof typeof WORKSHOP_POLL_ATTACHED_WORKSHOP_STYLES;

    /**
     * Where an occurrence leads when it is more than a label, for example into the room of that occurrence.
     */
    readonly createWorkshopLink?: (workshop: WorkshopSummary) => string;
    readonly label?: string;
    readonly className?: string;
};

/**
 * The workshop occurrences one poll is about.
 *
 * Note: The community administration, the administration of an occurrence and the community room all say the very same
 *       thing about a poll, so all three of them say it with this one component instead of three lists which could
 *       drift apart.
 */
export function WorkshopPollAttachedWorkshops({
    workshops,
    variant = 'light',
    createWorkshopLink,
    label = 'Týká se workshopů',
    className = '',
}: WorkshopPollAttachedWorkshopsProps) {
    if (workshops.length === 0) {
        return null;
    }

    const badgeClassName = `inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${WORKSHOP_POLL_ATTACHED_WORKSHOP_STYLES[variant]}`;

    return (
        <ul aria-label={label} className={`flex flex-wrap gap-1.5 ${className}`}>
            {workshops.map((workshop) => {
                const workshopLabel = (
                    <>
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 break-words">
                            {workshop.title} · {formatCzechWorkshopShortDate(workshop.startsAt)}
                        </span>
                    </>
                );

                return (
                    <li key={workshop.id} className="min-w-0">
                        {createWorkshopLink === undefined ? (
                            <span className={badgeClassName}>{workshopLabel}</span>
                        ) : (
                            <Link href={createWorkshopLink(workshop)} className={badgeClassName}>
                                {workshopLabel}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
