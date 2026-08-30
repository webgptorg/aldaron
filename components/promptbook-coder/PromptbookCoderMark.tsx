import { cn } from '@/lib/utils';

/**
 * Square the octopus is drawn in
 */
const MARK_VIEW_BOX_SIZE = 24;

/**
 * Mantle of the octopus with its two eyes cut out of it
 *
 * Note: The eyes are subpaths of the very same path rather than circles of their own, so that `evenodd` turns them
 *       into holes. The mark is then a single shape in one colour and shows whatever it is placed on through the
 *       eyes, which is what lets it sit on any background.
 */
const MARK_MANTLE_PATH_DATA = [
    'M12 2.4c-4.4 0-7.7 3.6-7.7 8.3 0 2.8 1.3 4.6 3.2 4.6 1 0 1.6-.5 2.3-.5s1.3.6 2.2.6 1.5-.6 2.2-.6 1.3.5 2.3.5c1.9 0 3.2-1.8 3.2-4.6 0-4.7-3.3-8.3-7.7-8.3Z',
    'M7.85 9.5a1.45 1.45 0 1 0 2.9 0 1.45 1.45 0 1 0-2.9 0Z',
    'M13.25 9.5a1.45 1.45 0 1 0 2.9 0 1.45 1.45 0 1 0-2.9 0Z',
].join('');

/**
 * The eight arms of the octopus, of which the five in front are drawn
 *
 * Note: Every one of them starts inside the mantle, so the drawn arm grows out from under it instead of being glued
 *       to its edge.
 */
const MARK_TENTACLE_PATH_DATA: readonly string[] = [
    'M6.9 13.8c-1 2.6-1.4 5-.6 7.4',
    'M9.4 14.6c-.7 2.6-.9 5.1-.1 7.3',
    'M12 14.9v7.1',
    'M14.6 14.6c.7 2.6.9 5.1.1 7.3',
    'M17.1 13.8c1 2.6 1.4 5 .6 7.4',
];

const MARK_TENTACLE_STROKE_WIDTH = 1.6;

/**
 * Length of one drawn piece of an arm and of the gap after it
 *
 * Note: The arms are dashed because the octopus this mark simplifies is drawn out of terminal characters, where an
 *       arm is a column of separate glyphs rather than a continuous line.
 */
const MARK_TENTACLE_DASH_ARRAY = '2.1 1.6';

/**
 * The octopus of Promptbook coder, simplified from the one its terminal draws in ASCII characters
 *
 * Note: It is drawn in `currentColor`, so whoever places it decides its colour.
 *
 * @param className sizing and colour of the mark, which has no size of its own
 */
export function PromptbookCoderMark({ className }: { readonly className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox={`0 0 ${MARK_VIEW_BOX_SIZE} ${MARK_VIEW_BOX_SIZE}`}
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            {MARK_TENTACLE_PATH_DATA.map((tentaclePathData) => (
                <path
                    key={tentaclePathData}
                    d={tentaclePathData}
                    stroke="currentColor"
                    strokeWidth={MARK_TENTACLE_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={MARK_TENTACLE_DASH_ARRAY}
                />
            ))}

            <path d={MARK_MANTLE_PATH_DATA} fill="currentColor" fillRule="evenodd" />
        </svg>
    );
}
