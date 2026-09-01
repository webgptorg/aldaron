import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';

/**
 * Edge of the square the snake of the show is drawn in
 */
export const AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE = 128;

/**
 * How a drawn part of the snake is coloured
 */
export type AiTaKrajtaMarkPaint = { readonly kind: 'solid'; readonly color: string } | { readonly kind: 'gradient' };

/**
 * One point in the square coordinate system used by the artwork
 */
export type AiTaKrajtaMarkPoint = {
    readonly x: number;
    readonly y: number;
};

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
 * Identifiers of the separately layered parts of the canonical snake artwork
 */
export type AiTaKrajtaMarkShapeId = 'tail' | 'coil' | 'neck' | 'head';

/**
 * One drawn part of the snake
 *
 * Note: It is described as data rather than as markup, so that the same animal can be turned into React elements for
 *       the page and into a standalone SVG document for the icon of the browser tab.
 */
export type AiTaKrajtaMarkShape = {
    readonly id: AiTaKrajtaMarkShapeId;
    readonly paint: AiTaKrajtaMarkPaint;
} & (
    | { readonly kind: 'filledPath'; readonly pathData: string }
    | { readonly kind: 'strokedPath'; readonly pathData: string; readonly strokeWidth: number }
    | {
          readonly kind: 'filledEllipse';
          readonly centerX: number;
          readonly centerY: number;
          readonly radiusX: number;
          readonly radiusY: number;
          readonly rotationInDegrees: number;
      }
);

const GRADIENT_PAINT: AiTaKrajtaMarkPaint = { kind: 'gradient' };
const CORAL_PAINT: AiTaKrajtaMarkPaint = { kind: 'solid', color: AI_TA_KRAJTA_COLORS.CORAL };

/**
 * The gradient which runs through the whole animal, from the coral head down to the indigo tail
 */
export const AI_TA_KRAJTA_MARK_GRADIENT = {
    x1: 76,
    y1: 24,
    x2: 30,
    y2: 100,
    stops: [
        { offset: 0, color: AI_TA_KRAJTA_COLORS.CORAL },
        { offset: 0.45, color: '#d1809f' },
        { offset: 1, color: AI_TA_KRAJTA_COLORS.INDIGO },
    ],
} as const;

/**
 * Ends of the body of a snake are round wherever it is drawn as a stroke
 */
export const AI_TA_KRAJTA_MARK_STROKE_LINE_CAP = 'round';

/**
 * The snake of the show, in the order its parts are drawn over each other
 */
export const AI_TA_KRAJTA_MARK_SHAPES: readonly AiTaKrajtaMarkShape[] = [
    {
        // The tail, which slides out to the right from under the coil
        id: 'tail',
        kind: 'filledPath',
        pathData: 'M56 80L108 97L54 103Z',
        paint: CORAL_PAINT,
    },
    {
        // The coiled body
        id: 'coil',
        kind: 'filledPath',
        pathData: 'M22 86C22 74 34 67 51 67C67 67 77 74 77 85C77 96 64 102 47 102C29 102 22 97 22 86Z',
        paint: GRADIENT_PAINT,
    },
    {
        // The neck rising out of the coil
        id: 'neck',
        kind: 'strokedPath',
        pathData: 'M67 92C67 72 64 48 70 36',
        strokeWidth: 18,
        paint: GRADIENT_PAINT,
    },
    {
        // The head at the top of the neck
        id: 'head',
        kind: 'filledEllipse',
        centerX: 71,
        centerY: 29,
        radiusX: 15,
        radiusY: 12.5,
        rotationInDegrees: -10,
        paint: CORAL_PAINT,
    },
];

/**
 * The lower, coiled part of the logo which stays put while the head first uncoils
 */
export const AI_TA_KRAJTA_MARK_BODY_SHAPE_IDS: readonly AiTaKrajtaMarkShapeId[] = ['tail', 'coil'];

/**
 * The parts which leave the logo first when its snake starts moving
 */
export const AI_TA_KRAJTA_MARK_HEAD_AND_NECK_SHAPE_IDS: readonly AiTaKrajtaMarkShapeId[] = ['neck', 'head'];

/**
 * The path a living version of the mark follows from its head to its tail
 *
 * Note: The cover mark is built from overlapping filled shapes rather than one stroke. These points describe its
 *       centre line so the game can release the same animal instead of replacing it with a different, straight one.
 */
export const AI_TA_KRAJTA_MARK_SPINE_POINTS: readonly AiTaKrajtaMarkPoint[] = [
    { x: 71, y: 29 },
    { x: 70, y: 36 },
    { x: 67, y: 46 },
    { x: 65, y: 57 },
    { x: 65, y: 68 },
    { x: 66, y: 79 },
    { x: 67, y: 89 },
    { x: 63, y: 94 },
    { x: 54, y: 98 },
    { x: 43, y: 98 },
    { x: 33, y: 95 },
    { x: 27, y: 90 },
    { x: 28, y: 84 },
    { x: 34, y: 79 },
    { x: 43, y: 76 },
    { x: 53, y: 76 },
    { x: 63, y: 80 },
    { x: 71, y: 86 },
    { x: 79, y: 91 },
    { x: 89, y: 94 },
    { x: 99, y: 96 },
    { x: 108, y: 97 },
];

/**
 * Where the drawn animal really sits inside its view box, measured off the shapes above including the width of the
 * stroke of the neck
 *
 * Note: The snake is drawn a little above and to the right of the middle of its box, which nobody notices beside a
 *       heading but which is plain to see once the mark is the only thing inside an icon. An icon therefore moves it
 *       into the middle of its tile.
 */
export const AI_TA_KRAJTA_MARK_BOUNDS = {
    left: 22,
    top: 16,
    right: 108,
    bottom: 103,
} as const;

/**
 * Places a point of the vector artwork into a rendered frame
 */
export function placeAiTaKrajtaMarkPointInFrame(
    point: AiTaKrajtaMarkPoint,
    frame: AiTaKrajtaMarkFrame,
): AiTaKrajtaMarkPoint {
    return {
        x: frame.left + (point.x / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.width,
        y: frame.top + (point.y / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE) * frame.height,
    };
}

/**
 * The `fill` or `stroke` a shape is drawn with
 *
 * @param paint what the shape is coloured by
 * @param gradientId id the gradient of the mark is defined under in the document being drawn
 */
export function createAiTaKrajtaMarkPaintValue(paint: AiTaKrajtaMarkPaint, gradientId: string): string {
    return paint.kind === 'gradient' ? `url(#${gradientId})` : paint.color;
}
