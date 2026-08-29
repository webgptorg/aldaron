import {
    getWorkshopPhaseAppearance,
    type WorkshopPhaseTone,
} from '@/components/workshops/workshopPhaseAppearance';
import { classNames } from '@/lib/classNames';
import type { WorkshopPhase } from '@/lib/workshops/workshopPhase';

type WorkshopPhaseBadgeProps = {
    readonly phase: WorkshopPhase;

    /**
     * Background this badge is placed on
     */
    readonly tone?: WorkshopPhaseTone;
    readonly className?: string;
};

/**
 * Says where one term stands in time, in the one colour that phase is drawn with everywhere
 */
export function WorkshopPhaseBadge({ phase, tone = 'light', className }: WorkshopPhaseBadgeProps) {
    const { label, badgeClassNameByTone } = getWorkshopPhaseAppearance(phase);

    return (
        <span
            className={classNames(
                'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                badgeClassNameByTone[tone],
                className,
            )}
        >
            {label}
        </span>
    );
}
