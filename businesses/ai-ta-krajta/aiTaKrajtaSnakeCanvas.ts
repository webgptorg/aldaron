import {
    AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP,
    createAiTaKrajtaSnakeBodySlices,
    type AiTaKrajtaSnakeBodyPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import type { SnakeFood } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';

/**
 * Where an eye sits on the head and how big it is, in units of the view box of the mark
 */
const EYE_FORWARD_OFFSET = 5;
const EYE_SIDEWAYS_OFFSET = 5.5;
const EYE_RADIUS = 3.4;
const PUPIL_FORWARD_OFFSET = 1.2;
const PUPIL_RADIUS = 1.6;

/**
 * Size of one token and of the glow around it, in units of the view box of the mark
 */
const FOOD_RADIUS = 3.7;
const FOOD_GLOW_RADIUS = 8.6;

/**
 * How much of the colour of a token is left in the glow around it
 */
const FOOD_GLOW_OPACITY = 0.22;

/**
 * Draws the animal along a centre line, head first
 *
 * Note: The slices come from the same description the mark is drawn from, so a snake standing in the pose of the logo
 *       is the logo rather than a copy of it.
 *
 * @param centerLine where the body runs, from the head to the tip of the tail
 * @param halfWidthScale how much thicker the animal is drawn than the mark measures it
 */
export function drawAiTaKrajtaSnakeBody(
    context: CanvasRenderingContext2D,
    centerLine: readonly AiTaKrajtaSnakeBodyPoint[],
    halfWidthScale: number,
): void {
    context.save();
    context.lineCap = AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP;

    for (const slice of createAiTaKrajtaSnakeBodySlices(centerLine, halfWidthScale)) {
        context.strokeStyle = slice.color;
        context.lineWidth = slice.strokeWidth;
        context.stroke(new Path2D(slice.pathData));
    }

    context.restore();
}

/**
 * Draws the eyes, which is what turns a drawn snake into an animal which is looking where it goes
 *
 * Note: The mark has none, so they open as the snake wakes up rather than the moment the game begins.
 */
export function drawAiTaKrajtaSnakeEyes(
    context: CanvasRenderingContext2D,
    headPosition: AiTaKrajtaSnakeBodyPoint,
    headAngleInRadians: number,
    halfWidthScale: number,
    opacity: number,
): void {
    if (opacity <= 0) {
        return;
    }

    const sidewaysAngle = headAngleInRadians + Math.PI / 2;

    context.save();
    context.globalAlpha = opacity;

    for (const side of [-1, 1]) {
        const eyePosition = {
            x:
                headPosition.x +
                (Math.cos(headAngleInRadians) * EYE_FORWARD_OFFSET + Math.cos(sidewaysAngle) * EYE_SIDEWAYS_OFFSET * side) *
                    halfWidthScale,
            y:
                headPosition.y +
                (Math.sin(headAngleInRadians) * EYE_FORWARD_OFFSET + Math.sin(sidewaysAngle) * EYE_SIDEWAYS_OFFSET * side) *
                    halfWidthScale,
        };

        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(eyePosition.x, eyePosition.y, EYE_RADIUS * halfWidthScale, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = AI_TA_KRAJTA_COLORS.MOSS_DEEP;
        context.beginPath();
        context.arc(
            eyePosition.x + Math.cos(headAngleInRadians) * PUPIL_FORWARD_OFFSET * halfWidthScale,
            eyePosition.y + Math.sin(headAngleInRadians) * PUPIL_FORWARD_OFFSET * halfWidthScale,
            PUPIL_RADIUS * halfWidthScale,
            0,
            Math.PI * 2,
        );
        context.fill();
    }

    context.restore();
}

/**
 * Draws the tokens lying on the field, which are laid out as the snake wakes up
 */
export function drawAiTaKrajtaSnakeFood(
    context: CanvasRenderingContext2D,
    food: readonly SnakeFood[],
    halfWidthScale: number,
    opacity: number,
): void {
    if (opacity <= 0) {
        return;
    }

    context.save();

    for (const token of food) {
        context.fillStyle = token.isWarm ? AI_TA_KRAJTA_COLORS.CORAL : AI_TA_KRAJTA_COLORS.INDIGO;

        context.globalAlpha = opacity * FOOD_GLOW_OPACITY;
        context.beginPath();
        context.arc(token.position.x, token.position.y, FOOD_GLOW_RADIUS * halfWidthScale, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(token.position.x, token.position.y, FOOD_RADIUS * halfWidthScale, 0, Math.PI * 2);
        context.fill();
    }

    context.restore();
}
