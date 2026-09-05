/**
 * A source of random numbers between zero and one, handed in so that a test can repeat the same draw
 *
 * Note: `Math.random` is one of these. Everything which draws something takes this instead of reaching for
 *       `Math.random` on its own, so that a test can hand it a sequence it already knows the outcome of.
 */
export type CreateRandomNumber = () => number;
