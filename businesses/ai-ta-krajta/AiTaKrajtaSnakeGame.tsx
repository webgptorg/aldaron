'use client';

import {
    advanceSnakeState,
    createSnakeState,
    getSnakeSegments,
    type SnakeBounds,
    type SnakePoint,
    type SnakeState,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { useEffect, useRef, type PointerEvent } from 'react';

/**
 * Radius of the head and of the tip of the tail, in pixels
 */
const HEAD_RADIUS_IN_PIXELS = 13;
const TAIL_RADIUS_IN_PIXELS = 4;

/**
 * Radius of one token and of the glow around it, in pixels
 */
const FOOD_RADIUS_IN_PIXELS = 6;
const FOOD_GLOW_RADIUS_IN_PIXELS = 14;

/**
 * Radius of the body at one point along its center line
 */
function getSnakeRadius(segmentIndex: number, segmentCount: number): number {
    const ratioFromHead = segmentIndex / Math.max(1, segmentCount - 1);

    return HEAD_RADIUS_IN_PIXELS - (HEAD_RADIUS_IN_PIXELS - TAIL_RADIUS_IN_PIXELS) * ratioFromHead;
}

/**
 * A unit vector pointing in an angle used by the simulation
 */
function getDirectionFromAngle(angleInRadians: number): SnakePoint {
    return { x: Math.cos(angleInRadians), y: Math.sin(angleInRadians) };
}

/**
 * The heading of a point along the snake, falling back to the head direction while its trail is still being built
 */
function getSnakeDirection(
    segments: readonly SnakePoint[],
    segmentIndex: number,
    fallbackAngleInRadians: number,
): SnakePoint {
    const currentSegment = segments[segmentIndex];

    if (currentSegment === undefined) {
        return getDirectionFromAngle(fallbackAngleInRadians);
    }

    const previousSegment = segments[Math.max(0, segmentIndex - 1)] ?? currentSegment;
    const nextSegment = segments[Math.min(segments.length - 1, segmentIndex + 1)] ?? currentSegment;
    const directionX = previousSegment.x - nextSegment.x;
    const directionY = previousSegment.y - nextSegment.y;
    const directionLength = Math.hypot(directionX, directionY);

    if (directionLength === 0) {
        return getDirectionFromAngle(fallbackAngleInRadians);
    }

    return { x: directionX / directionLength, y: directionY / directionLength };
}

/**
 * The left and right edge of the snake, ordered into one closed contour
 */
function getSnakeBodyOutline(segments: readonly SnakePoint[], fallbackAngleInRadians: number): readonly SnakePoint[] {
    const leftSide: SnakePoint[] = [];
    const rightSide: SnakePoint[] = [];

    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
        const segment = segments[segmentIndex];

        if (segment === undefined) {
            continue;
        }

        const direction = getSnakeDirection(segments, segmentIndex, fallbackAngleInRadians);
        const radius = getSnakeRadius(segmentIndex, segments.length);
        const normalX = -direction.y * radius;
        const normalY = direction.x * radius;

        leftSide.push({ x: segment.x + normalX, y: segment.y + normalY });
        rightSide.push({ x: segment.x - normalX, y: segment.y - normalY });
    }

    return [...leftSide, ...rightSide.reverse()];
}

/**
 * Draws a contour with rounded transitions, avoiding visible joints between the remembered trail points
 */
function drawRoundedContour(context: CanvasRenderingContext2D, outline: readonly SnakePoint[]): void {
    const firstPoint = outline[0];
    const lastPoint = outline[outline.length - 1];

    if (firstPoint === undefined || lastPoint === undefined) {
        return;
    }

    context.beginPath();
    context.moveTo((lastPoint.x + firstPoint.x) / 2, (lastPoint.y + firstPoint.y) / 2);

    for (let pointIndex = 0; pointIndex < outline.length; pointIndex++) {
        const point = outline[pointIndex];
        const nextPoint = outline[(pointIndex + 1) % outline.length];

        if (point === undefined || nextPoint === undefined) {
            continue;
        }

        context.quadraticCurveTo(point.x, point.y, (point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2);
    }

    context.closePath();
}

/**
 * The color which flows from the tail to the head of the snake
 */
function createSnakeGradient(
    context: CanvasRenderingContext2D,
    tailPosition: SnakePoint,
    headPosition: SnakePoint,
): CanvasGradient {
    const gradient = context.createLinearGradient(tailPosition.x, tailPosition.y, headPosition.x, headPosition.y);

    gradient.addColorStop(0, AI_TA_KRAJTA_COLORS.INDIGO);
    gradient.addColorStop(1, AI_TA_KRAJTA_COLORS.CORAL);

    return gradient;
}

/**
 * Draws the tokens lying on the field
 */
function drawFood(context: CanvasRenderingContext2D, state: SnakeState): void {
    for (const food of state.food) {
        const color = food.isWarm ? AI_TA_KRAJTA_COLORS.CORAL : AI_TA_KRAJTA_COLORS.INDIGO;

        context.globalAlpha = 0.22;
        context.fillStyle = color;
        context.beginPath();
        context.arc(food.position.x, food.position.y, FOOD_GLOW_RADIUS_IN_PIXELS, 0, Math.PI * 2);
        context.fill();

        context.globalAlpha = 1;
        context.beginPath();
        context.arc(food.position.x, food.position.y, FOOD_RADIUS_IN_PIXELS, 0, Math.PI * 2);
        context.fill();
    }
}

/**
 * Draws the eyes, which is what turns a row of circles into an animal
 */
function drawEyes(context: CanvasRenderingContext2D, state: SnakeState): void {
    const sidewaysAngle = state.headAngleInRadians + Math.PI / 2;

    for (const side of [-1, 1]) {
        const eyePosition: SnakePoint = {
            x:
                state.headPosition.x +
                Math.cos(state.headAngleInRadians) * 5 +
                Math.cos(sidewaysAngle) * 5.5 * side,
            y:
                state.headPosition.y +
                Math.sin(state.headAngleInRadians) * 5 +
                Math.sin(sidewaysAngle) * 5.5 * side,
        };

        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(eyePosition.x, eyePosition.y, 3.4, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = AI_TA_KRAJTA_COLORS.MOSS_DEEP;
        context.beginPath();
        context.arc(
            eyePosition.x + Math.cos(state.headAngleInRadians) * 1.2,
            eyePosition.y + Math.sin(state.headAngleInRadians) * 1.2,
            1.6,
            0,
            Math.PI * 2,
        );
        context.fill();
    }
}

/**
 * Draws the continuous, tapered body and puts a round head over its leading edge
 */
function drawSnake(context: CanvasRenderingContext2D, state: SnakeState): void {
    const segments = getSnakeSegments(state);
    const headPosition = segments[0];
    const tailPosition = segments[segments.length - 1];

    if (headPosition === undefined || tailPosition === undefined) {
        return;
    }

    drawRoundedContour(context, getSnakeBodyOutline(segments, state.headAngleInRadians));
    context.fillStyle = createSnakeGradient(context, tailPosition, headPosition);
    context.fill();

    context.fillStyle = AI_TA_KRAJTA_COLORS.CORAL;
    context.beginPath();
    context.arc(state.headPosition.x, state.headPosition.y, HEAD_RADIUS_IN_PIXELS, 0, Math.PI * 2);
    context.fill();

    drawEyes(context, state);
}

/**
 * The snake of the logo, let loose
 *
 * Note: It moves freely rather than jumping from square to square, so it steers the way a snake in a browser game
 *       does. The whole game is `aiTaKrajtaSnakeSimulation`, this only draws what it returns and feeds the pointer
 *       into it.
 *
 */
export function AiTaKrajtaSnakeGame() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetPositionRef = useRef<SnakePoint | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d') ?? null;

        if (canvas === null || context === null) {
            return;
        }

        let bounds: SnakeBounds = { width: canvas.clientWidth, height: canvas.clientHeight };
        let state = createSnakeState(bounds, Math.random);
        let lastFrameTimestamp: number | null = null;
        let animationFrameId = 0;

        const resizeCanvas = () => {
            const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);

            bounds = { width: canvas.clientWidth, height: canvas.clientHeight };
            canvas.width = Math.max(1, Math.round(bounds.width * devicePixelRatio));
            canvas.height = Math.max(1, Math.round(bounds.height * devicePixelRatio));
            context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        };

        const renderFrame = (frameTimestamp: number) => {
            const stepInSeconds = lastFrameTimestamp === null ? 0 : (frameTimestamp - lastFrameTimestamp) / 1000;
            lastFrameTimestamp = frameTimestamp;

            state = advanceSnakeState(state, {
                bounds,
                targetPosition: targetPositionRef.current,
                stepInSeconds,
                createRandomNumber: Math.random,
            });

            context.clearRect(0, 0, bounds.width, bounds.height);
            drawFood(context, state);
            drawSnake(context, state);

            animationFrameId = window.requestAnimationFrame(renderFrame);
        };

        resizeCanvas();
        animationFrameId = window.requestAnimationFrame(renderFrame);

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, []);

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        const canvasBounds = event.currentTarget.getBoundingClientRect();

        targetPositionRef.current = {
            x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top,
        };
    };

    const handlePointerLeave = () => {
        targetPositionRef.current = null;
    };

    return (
        <div className="relative h-full w-full">
            <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerLeave}
                className="h-full w-full cursor-crosshair touch-none"
                aria-label="Krajta, veďte ji myší nebo prstem"
                role="img"
            />
        </div>
    );
}
