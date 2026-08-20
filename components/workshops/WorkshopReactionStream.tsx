'use client';

import { WorkshopFlyingReaction } from '@/components/workshops/WorkshopFlyingReaction';
import '@/components/workshops/workshopReactionAnimations.css';
import { cn } from '@/lib/utils';
import type { FlyingWorkshopReaction } from '@/lib/workshops/workshopReactionAnimations';
import { useReducedMotion } from 'framer-motion';

type WorkshopReactionStreamProps = {
    readonly reactions: readonly FlyingWorkshopReaction[];
    readonly className?: string;
};

/**
 * The layer over which the reactions of a workshop fly
 *
 * Note: The layer is the one place which brings the stylesheet of the animations in, so anything which shows flying
 *       reactions renders this component and never has to know how a single reaction is drawn.
 */
export function WorkshopReactionStream({ reactions, className }: WorkshopReactionStreamProps) {
    const isReducedMotionPreferred = useReducedMotion() === true;

    return (
        <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 z-10 overflow-hidden', className)}>
            {reactions.map((reaction) => (
                <WorkshopFlyingReaction
                    key={reaction.flightId}
                    reaction={reaction}
                    isReducedMotionPreferred={isReducedMotionPreferred}
                />
            ))}
        </div>
    );
}
