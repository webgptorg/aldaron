import type { CreateRandomNumber } from '@/lib/random/CreateRandomNumber';

/**
 * The place one item drew for itself, the highest key ending up first
 *
 * Note: This is the exponential ordering of Efraimidis and Spirakis. Sorting by `random ^ (1 / weight)` gives exactly
 *       the same result as drawing the items one after another, each with a chance proportional to its weight, but it
 *       is a single pass and needs no running total. A heavier item raises its random number to a smaller power, which
 *       pulls the number closer to one, which is why weight leans on the order without ever deciding it.
 */
function createDrawnSortKey(weight: number, createRandomNumber: CreateRandomNumber): number {
    return createRandomNumber() ** (1 / weight);
}

/**
 * Shuffles a list so that a heavier item is more likely to come out near its front
 *
 * @param items the list to draw an order for, which is left as it is
 * @param getWeight how much of a chance one item has, which should be greater than zero - an item of no weight at all
 *                  can only ever come last
 * @param createRandomNumber where the draw takes its numbers from
 * @returns a new list holding every item exactly once
 */
export function shuffleByWeight<TItem>(
    items: readonly TItem[],
    {
        getWeight,
        createRandomNumber,
    }: {
        readonly getWeight: (item: TItem) => number;
        readonly createRandomNumber: CreateRandomNumber;
    },
): readonly TItem[] {
    return items
        .map((item) => ({ item, sortKey: createDrawnSortKey(getWeight(item), createRandomNumber) }))
        .sort((firstDraw, secondDraw) => secondDraw.sortKey - firstDraw.sortKey)
        .map((draw) => draw.item);
}
