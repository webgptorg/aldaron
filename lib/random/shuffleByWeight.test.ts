import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';
import { shuffleByWeight } from '@/lib/random/shuffleByWeight';
import { describe, expect, it } from 'vitest';

type WeightedItem = {
    readonly name: string;
    readonly weight: number;
};

const HEAVY_ITEM: WeightedItem = { name: 'heavy', weight: 10 };
const LIGHT_ITEM: WeightedItem = { name: 'light', weight: 1 };

/**
 * A source of random numbers which always answers the same, so that a test draws the same order twice
 */
function createPredictableRandomNumber(): CreateRandomNumber {
    let seed = 1;

    return () => {
        seed = (seed * 48271) % 2147483647;

        return seed / 2147483647;
    };
}

/**
 * Reads one draw of a pair of items back as the name which came out on top
 */
function drawWinner(createRandomNumber: CreateRandomNumber): string {
    return shuffleByWeight([HEAVY_ITEM, LIGHT_ITEM], { getWeight: (item) => item.weight, createRandomNumber })[0].name;
}

describe('shuffleByWeight', () => {
    it('hands back every item exactly once', () => {
        const items = ['a', 'b', 'c', 'd', 'e'];

        const shuffled = shuffleByWeight(items, { getWeight: () => 1, createRandomNumber: Math.random });

        expect([...shuffled].sort()).toEqual(items);
    });

    it('leaves the list it was given alone', () => {
        const items = ['a', 'b', 'c'];

        shuffleByWeight(items, { getWeight: () => 1, createRandomNumber: Math.random });

        expect(items).toEqual(['a', 'b', 'c']);
    });

    it('lets the heavier item win a draw both items drew the same number in', () => {
        expect(drawWinner(() => 0.5)).toBe('heavy');
    });

    it('still lets the lighter item win when it draws far better', () => {
        const drawnNumbers = [0.001, 0.9];

        expect(drawWinner(() => drawnNumbers.shift()!)).toBe('light');
    });

    it('brings the heavier item to the front of most draws but not of all of them', () => {
        const createRandomNumber = createPredictableRandomNumber();

        const winners = Array.from({ length: 1000 }, () => drawWinner(createRandomNumber));
        const heavyWinCount = winners.filter((winner) => winner === 'heavy').length;

        // Note: Ten times the weight means winning ten draws out of eleven, so the band is wide enough to hold any
        //       source of random numbers and still narrow enough to catch a shuffle which stopped weighing anything.
        expect(heavyWinCount).toBeGreaterThan(800);
        expect(heavyWinCount).toBeLessThan(980);
    });

    it('can only put an item of no weight at all last', () => {
        const items: readonly WeightedItem[] = [{ name: 'nothing', weight: 0 }, LIGHT_ITEM, HEAVY_ITEM];

        const shuffled = shuffleByWeight(items, { getWeight: (item) => item.weight, createRandomNumber: Math.random });

        expect(shuffled[shuffled.length - 1].name).toBe('nothing');
    });
});
