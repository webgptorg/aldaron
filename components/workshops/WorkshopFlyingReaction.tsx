'use client';

import {
    createWorkshopReactionDecorationStyle,
    createWorkshopReactionStyle,
} from '@/lib/workshops/workshopReactionAnimationStyle';
import {
    getWorkshopReactionAnimation,
    getWorkshopReactionClassNames,
    MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT,
    toCalmWorkshopReactionAnimation,
    type FlyingWorkshopReaction,
} from '@/lib/workshops/workshopReactionAnimations';

type WorkshopFlyingReactionProps = {
    readonly reaction: FlyingWorkshopReaction;

    /**
     * Whether the participant asked the operating system to move as little as possible
     */
    readonly isReducedMotionPreferred: boolean;
};

/**
 * One reaction on its way over the stage
 *
 * Note: The element only carries the class names and the numbers of its flight, everything else is animated by the
 *       stylesheet. A reaction therefore costs one render and no frame of JavaScript at all, no matter how many of
 *       them a big workshop sends at once.
 */
export function WorkshopFlyingReaction({ reaction, isReducedMotionPreferred }: WorkshopFlyingReactionProps) {
    const matchedAnimation = getWorkshopReactionAnimation(reaction.reactionText);
    const animation = isReducedMotionPreferred ? toCalmWorkshopReactionAnimation(matchedAnimation) : matchedAnimation;
    const classNames = getWorkshopReactionClassNames(animation);
    const { decoration } = animation;
    const decorationClassName = classNames.decoration;

    return (
        <span className={classNames.root} style={createWorkshopReactionStyle(reaction.flightId, animation)}>
            <span className={classNames.body}>{reaction.reactionText}</span>
            {decoration !== null &&
                decorationClassName !== null &&
                Array.from({ length: Math.min(decoration.count, MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT) }).map(
                    (_, decorationIndex) => (
                        <span
                            key={decorationIndex}
                            className={decorationClassName}
                            style={createWorkshopReactionDecorationStyle(reaction.flightId, decorationIndex)}
                        >
                            {decoration.text}
                        </span>
                    ),
                )}
        </span>
    );
}
