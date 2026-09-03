/**
 * Geometry of the octopus of Promptbook coder, simplified from the one its terminal draws
 *
 * Note: The terminal of `ptbk coder run` draws this animal out of characters:
 *
 *             .-""""-.              _/\/\/  \_/\/  \_/\_
 *           .'  .-.  '.          _/\/  _   /\/  _  /\/\__
 *          /   (o o)   \         \__/ /_/\/  \_/ \_/  \_/
 *         |      ^      |           /_/   \__/   \__/  /
 *         |   \___/     |
 *          \___________/
 *
 *       Every measurement below is that picture read off line by line, which is why the head is a dome on straight
 *       sides rather than a circle, why the arms are folded out of straight segments rather than curved, and why the
 *       whole animal is drawn in lines of one weight: a terminal has one weight of character and no other. The `^`
 *       beak of the fourth line is the one thing left out, because at the size a badge is read it closes up against
 *       the mouth below it into a smudge.
 */

/**
 * Square the octopus is drawn in
 */
export const PROMPTBOOK_CODER_MARK_VIEW_BOX_SIZE = 24;

/**
 * Weight of every drawn line of the octopus
 */
export const PROMPTBOOK_CODER_MARK_STROKE_WIDTH = 1.4;

/**
 * One eye of the octopus
 */
export type PromptbookCoderMarkEye = {
    readonly id: string;
    readonly x: number;
    readonly y: number;
    readonly radius: number;
};

/**
 * Head of the octopus, which is the `.-""""-.` dome closed by the `\___________/` floor
 */
export const PROMPTBOOK_CODER_MARK_HEAD_PATH_DATA = [
    'M3.2 10.2',
    'C3.2 5.6 7.1 2.6 12 2.6',
    'C16.9 2.6 20.8 5.6 20.8 10.2',
    'L20.8 12.2',
    'Q20.8 14.4 18.6 14.4',
    'L5.4 14.4',
    'Q3.2 14.4 3.2 12.2',
    'Z',
].join(' ');

/**
 * The two `(o o)` eyes
 *
 * Note: They are filled rather than ringed the way the characters write them, because a ring of this weight closes
 *       into a blot once the badge is read at the size it is worn at.
 */
export const PROMPTBOOK_CODER_MARK_EYES: readonly PromptbookCoderMarkEye[] = [
    { id: 'left', x: 9.3, y: 8.6, radius: 1.35 },
    { id: 'right', x: 14.7, y: 8.6, radius: 1.35 },
];

/**
 * The `\___/` mouth
 */
export const PROMPTBOOK_CODER_MARK_MOUTH_PATH_DATA = 'M9.5 11.5C10.2 13.5 13.8 13.5 14.5 11.5';

/**
 * The arms of the octopus, folded the way `_/\/\_` folds them
 *
 * Note: Each of them starts on the floor of the head, so an arm hangs off the body instead of being drawn beside it,
 *       and the outermost two start exactly where the floor turns up into the side, so the fringe is attached along
 *       the whole width of the animal. They are kept short and close together on purpose: fewer and longer ones read
 *       as the legs of an insect rather than as the arms of an octopus.
 */
export const PROMPTBOOK_CODER_MARK_ARM_PATH_DATA: readonly string[] = [
    'M5.4 14.4 L4.3 16.6 L5.9 18.8 L4.8 21',
    'M8.7 14.4 L7.7 16.7 L9.3 18.9 L8.3 21.2',
    'M12 14.4 L10.9 16.7 L13.1 19 L12 21.3',
    'M15.3 14.4 L16.3 16.7 L14.7 18.9 L15.7 21.2',
    'M18.6 14.4 L19.7 16.6 L18.1 18.8 L19.2 21',
];
