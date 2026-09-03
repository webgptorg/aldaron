import {
    createAiTaKrajtaSnakeBodySlices,
    getAiTaKrajtaSnakeBodyBounds,
    type AiTaKrajtaSnakeBodyPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';

/**
 * Edge of the square the snake of the show is drawn in
 */
export const AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE = 128;

/**
 * Where the square artwork is placed in another coordinate system
 */
export type AiTaKrajtaMarkFrame = {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
};

/**
 * The line the snake of the show is coiled along, from its head to the tip of its tail
 *
 * Note: This and the profile in `aiTaKrajtaSnakeBodyProfile` are the whole animal. The mark is not a picture of a
 *       snake which the game then replaces with a different, living one - it is this line, drawn still. That is why
 *       the game can pick the very same line up and start moving it without anything on the screen changing.
 */
export const AI_TA_KRAJTA_MARK_CENTER_LINE: readonly AiTaKrajtaSnakeBodyPoint[] = [
    { x: 71, y: 29 },
    { x: 70, y: 36 },
    { x: 67, y: 46 },
    { x: 65, y: 57 },
    { x: 65, y: 68 },
    { x: 66, y: 78 },
    { x: 67, y: 86 },
    { x: 64, y: 91 },
    { x: 56, y: 93 },
    { x: 46, y: 93 },
    { x: 37, y: 91 },
    { x: 31, y: 87 },
    { x: 32, y: 82 },
    { x: 38, y: 78 },
    { x: 47, y: 76 },
    { x: 57, y: 77 },
    { x: 66, y: 82 },
    { x: 74, y: 89 },
    { x: 83, y: 93 },
    { x: 92, y: 95 },
    { x: 100, y: 96 },
    { x: 108, y: 97 },
];

/**
 * The snake of the show, in the order its parts are drawn over each other
 */
export const AI_TA_KRAJTA_MARK_BODY_SLICES = createAiTaKrajtaSnakeBodySlices(AI_TA_KRAJTA_MARK_CENTER_LINE, 1);

/**
 * Where the drawn animal really sits inside its view box
 *
 * Note: The snake is drawn a little above and to the right of the middle of its box, which nobody notices beside a
 *       heading but which is plain to see once the mark is the only thing inside an icon. An icon therefore moves it
 *       into the middle of its tile. It is measured off the drawn animal rather than written down beside it, so that
 *       recoiling the snake cannot leave its icon off centre.
 */
export const AI_TA_KRAJTA_MARK_BOUNDS = getAiTaKrajtaSnakeBodyBounds(AI_TA_KRAJTA_MARK_CENTER_LINE, 1);

/**
 * The shadow the animal casts wherever it is drawn as large as it is in the terrarium
 *
 * Note: The still logo and the canvas of the game both wear it. A shadow which appeared or vanished at the moment the
 *       one is swapped for the other would be the one thing left to give that swap away.
 */
export const AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME = 'drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]';

/**
 * Places a point of the vector artwork into a rendered frame
 */
export function placeAiTaKrajtaMarkPointInFrame(
    point: AiTaKrajtaSnakeBodyPoint,
    frame: AiTaKrajtaMarkFrame,
): AiTaKrajtaSnakeBodyPoint {
    return {
        x: frame.left + (point.x / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.width,
        y: frame.top + (point.y / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.height,
    };
}

/**
 * How much thicker than the mark measures it an animal drawn into a frame is
 */
export function getAiTaKrajtaMarkFrameScale(frame: AiTaKrajtaMarkFrame): number {
    return frame.width / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE;
}
