/**
 * @vitest-environment jsdom
 */

import { WorkshopReactionStream } from '@/components/workshops/WorkshopReactionStream';
import { getWorkshopReactionAnimation } from '@/lib/workshops/workshopReactionAnimations';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);

function renderStream(reactions: readonly { readonly flightId: string; readonly reactionText: string }[]) {
    return render(<WorkshopReactionStream reactions={reactions} />);
}

describe('workshop reaction stream', () => {
    it('sends every reaction over the stage with the animation of its own', () => {
        const { container } = renderStream([
            { flightId: 'first', reactionText: '🎉' },
            { flightId: 'second', reactionText: '🐍' },
        ]);
        const [partyReaction, snakeReaction] = Array.from(container.querySelectorAll('.workshop-reaction'));

        expect(partyReaction.className).toContain('workshop-reaction-flight--launch');
        expect(partyReaction.querySelector('.workshop-reaction__body')?.className).toContain(
            'workshop-reaction-flourish--burst',
        );
        expect(snakeReaction.className).toContain('workshop-reaction-flight--slither');
        expect(snakeReaction.querySelector('.workshop-reaction__body')?.textContent).toBe('🐍');
    });

    it('hands the stylesheet how long the flight of this very reaction takes', () => {
        const { container } = renderStream([{ flightId: 'first', reactionText: '🐍' }]);
        const styleAttribute = container.querySelector('.workshop-reaction')?.getAttribute('style') ?? '';

        expect(styleAttribute).toContain(`${getWorkshopReactionAnimation('🐍').durationMilliseconds}ms`);
        expect(styleAttribute).toContain('left:');
    });

    it('throws the confetti of a party popper alongside it', () => {
        const { container } = renderStream([{ flightId: 'first', reactionText: '🎉' }]);

        expect(container.querySelectorAll('.workshop-reaction__decoration')).toHaveLength(3);
        expect(container.querySelector('.workshop-reaction__decoration')?.className).toContain(
            'workshop-reaction-decoration--scatter',
        );
    });

    it('flies a reaction nobody registered with the generic animation', () => {
        const { container } = renderStream([
            { flightId: 'first', reactionText: '🦄' },
            { flightId: 'second', reactionText: 'nasazeno!' },
        ]);
        const [unknownEmojiReaction, textReaction] = Array.from(container.querySelectorAll('.workshop-reaction'));

        expect(unknownEmojiReaction.className).toContain('workshop-reaction-flight--float');
        expect(unknownEmojiReaction.className).toContain('workshop-reaction-appearance--emoji');
        expect(textReaction.className).toContain('workshop-reaction-flight--float');
        expect(textReaction.className).toContain('workshop-reaction-appearance--code');
        expect(textReaction.textContent).toBe('nasazeno!');
    });

    it('keeps the whole stream away from the mouse and from a screen reader', () => {
        const { container } = renderStream([{ flightId: 'first', reactionText: '👍' }]);
        const stream = container.firstElementChild;

        expect(stream?.getAttribute('aria-hidden')).toBe('true');
        expect(stream?.className).toContain('pointer-events-none');
    });
});
