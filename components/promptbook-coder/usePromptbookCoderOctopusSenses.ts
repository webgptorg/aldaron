'use client';

import {
    resolvePromptbookCoderPointerAttention,
    type PromptbookCoderOctopusPerception,
    type PromptbookCoderScrollDirection,
} from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import { useEffect, useState, type RefObject } from 'react';

/**
 * What the octopus makes of the pointer, a pointer it has lost track of included
 */
type OctopusNoticedPointer = Pick<PromptbookCoderOctopusPerception, 'pointerGaze' | 'isPointerNear'>;

/**
 * How long one frame of the octopus stays on screen, in milliseconds
 */
const OCTOPUS_FRAME_IN_MILLISECONDS = 280;

/**
 * How long a pointer which stopped moving still holds the gaze of the octopus, in milliseconds
 */
const OCTOPUS_POINTER_ATTENTION_IN_MILLISECONDS = 2500;

/**
 * How long after the last scrolled pixel the page still counts as travelling, in milliseconds
 */
const OCTOPUS_SCROLL_ATTENTION_IN_MILLISECONDS = 450;

/**
 * What the octopus makes of a pointer it cannot see anywhere
 */
const OCTOPUS_UNNOTICED_POINTER: OctopusNoticedPointer = {
    pointerGaze: null,
    isPointerNear: false,
};

/**
 * Whether the visitor asked their system for as little movement as possible
 *
 * Note: Not every browser of a test environment answers this question, and one which does not is treated as one whose
 *       visitor never asked.
 */
function isReducedMotionPreferred(): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Counts the frames of the animation
 *
 * Note: A visitor who asked for less movement gets the first frame and no other, which leaves them an octopus that
 *       still looks at them and still greets them, but neither blinks nor waves on its own.
 *
 * @returns how many frames have passed since the octopus was first drawn
 */
function useOctopusAnimationTick(): number {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (isReducedMotionPreferred()) {
            return;
        }

        const frameTimer = window.setInterval(
            () => setTick((previousTick) => previousTick + 1),
            OCTOPUS_FRAME_IN_MILLISECONDS,
        );

        return () => window.clearInterval(frameTimer);
    }, []);

    return tick;
}

/**
 * Follows the pointer of the visitor across the whole page
 *
 * Note: The state is only replaced when the octopus would be drawn differently, so that a pointer swept across the
 *       page redraws the badge a handful of times rather than on every reported pixel.
 *
 * @param octopusElementRef the drawn octopus, whose middle every distance is measured from
 * @returns which way the pointer lies and whether it came close, both forgotten once it rests for a while
 */
function useOctopusPointerAttention(octopusElementRef: RefObject<HTMLElement | null>): OctopusNoticedPointer {
    const [pointerAttention, setPointerAttention] = useState<OctopusNoticedPointer>(OCTOPUS_UNNOTICED_POINTER);

    useEffect(() => {
        let forgettingTimer = 0;

        const handlePointerMove = (event: PointerEvent) => {
            const octopusElement = octopusElementRef.current;

            if (octopusElement === null) {
                return;
            }

            const octopusBounds = octopusElement.getBoundingClientRect();
            const noticedPointer = resolvePromptbookCoderPointerAttention(
                event.clientX - (octopusBounds.left + octopusBounds.width / 2),
                event.clientY - (octopusBounds.top + octopusBounds.height / 2),
            );

            setPointerAttention((previousAttention) =>
                previousAttention.pointerGaze === noticedPointer.pointerGaze &&
                previousAttention.isPointerNear === noticedPointer.isPointerNear
                    ? previousAttention
                    : noticedPointer,
            );

            window.clearTimeout(forgettingTimer);
            forgettingTimer = window.setTimeout(
                () => setPointerAttention(OCTOPUS_UNNOTICED_POINTER),
                OCTOPUS_POINTER_ATTENTION_IN_MILLISECONDS,
            );
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.clearTimeout(forgettingTimer);
        };
    }, [octopusElementRef]);

    return pointerAttention;
}

/**
 * Watches which way the page is being scrolled
 *
 * @returns the direction of travel, `null` once the page has stood still for a moment
 */
function useOctopusScrollDirection(): PromptbookCoderScrollDirection | null {
    const [scrollDirection, setScrollDirection] = useState<PromptbookCoderScrollDirection | null>(null);

    useEffect(() => {
        let lastScrollPosition = window.scrollY;
        let stillnessTimer = 0;

        const handleScroll = () => {
            const scrolledDistance = window.scrollY - lastScrollPosition;

            lastScrollPosition = window.scrollY;

            if (scrolledDistance === 0) {
                return;
            }

            setScrollDirection(scrolledDistance > 0 ? 'DOWN' : 'UP');

            window.clearTimeout(stillnessTimer);
            stillnessTimer = window.setTimeout(
                () => setScrollDirection(null),
                OCTOPUS_SCROLL_ATTENTION_IN_MILLISECONDS,
            );
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.clearTimeout(stillnessTimer);
        };
    }, []);

    return scrollDirection;
}

/**
 * Everything the octopus notices about the visitor and about the page it sits on
 *
 * Note: This is the only part of the badge which listens to the browser. What is then made of what it notices is
 *       decided by `selectPromptbookCoderOctopusPose` and drawn by `drawPromptbookCoderOctopus`, neither of which
 *       knows that a browser exists.
 *
 * @param octopusElementRef the drawn octopus, which the pointer is measured against
 * @returns what to hand to `selectPromptbookCoderOctopusPose`, short of what the visitor does to the badge itself
 */
export function usePromptbookCoderOctopusSenses(
    octopusElementRef: RefObject<HTMLElement | null>,
): PromptbookCoderOctopusPerception {
    const tick = useOctopusAnimationTick();
    const { pointerGaze, isPointerNear } = useOctopusPointerAttention(octopusElementRef);
    const scrollDirection = useOctopusScrollDirection();

    return { tick, pointerGaze, isPointerNear, scrollDirection };
}
