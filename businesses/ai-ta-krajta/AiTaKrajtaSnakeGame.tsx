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
import { useEffect, useRef, useState, type PointerEvent } from 'react';

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
 * Reads a color written as `#rrggbb`
 */
function readColorChannels(hexColor: string): readonly [number, number, number] {
    return [
        Number.parseInt(hexColor.slice(1, 3), 16),
        Number.parseInt(hexColor.slice(3, 5), 16),
        Number.parseInt(hexColor.slice(5, 7), 16),
    ];
}

/**
 * Mixes two colors, so that the body of the snake runs from one end of the palette to the other
 *
 * @param ratio zero for the first color, one for the second one
 */
function mixColors(firstColor: string, secondColor: string, ratio: number): string {
    const firstChannels = readColorChannels(firstColor);
    const secondChannels = readColorChannels(secondColor);
    const mixedChannels = firstChannels.map((channel, channelIndex) =>
        Math.round(channel + (secondChannels[channelIndex] - channel) * ratio),
    );

    return `rgb(${mixedChannels.join(', ')})`;
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
 * Draws the snake from the tip of its tail up to its head, so that the head ends up on top
 */
function drawSnake(context: CanvasRenderingContext2D, state: SnakeState): void {
    const segments = getSnakeSegments(state);

    for (let segmentIndex = segments.length - 1; segmentIndex >= 0; segmentIndex--) {
        const segment = segments[segmentIndex];
        const ratioFromHead = segmentIndex / Math.max(1, segments.length - 1);
        const radius = HEAD_RADIUS_IN_PIXELS - (HEAD_RADIUS_IN_PIXELS - TAIL_RADIUS_IN_PIXELS) * ratioFromHead;

        context.fillStyle = mixColors(AI_TA_KRAJTA_COLORS.CORAL, AI_TA_KRAJTA_COLORS.INDIGO, ratioFromHead);
        context.beginPath();
        context.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
        context.fill();
    }

    drawEyes(context, state);
}

/**
 * The snake of the logo, let loose
 *
 * Note: It moves freely rather than jumping from square to square, so it steers the way a snake in a browser game
 *       does. The whole game is `aiTaKrajtaSnakeSimulation`, this only draws what it returns and feeds the pointer
 *       into it.
 *
 * @param onScoreChange called whenever a token is eaten, so the section around can show the score
 */
export function AiTaKrajtaSnakeGame({ onScoreChange }: { readonly onScoreChange?: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetPositionRef = useRef<SnakePoint | null>(null);
    const [isPointerOnField, setIsPointerOnField] = useState(false);

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
        let lastReportedScore = 0;

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

            if (state.score !== lastReportedScore) {
                lastReportedScore = state.score;
                onScoreChange?.(state.score);
            }

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
    }, [onScoreChange]);

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
        const canvasBounds = event.currentTarget.getBoundingClientRect();

        targetPositionRef.current = {
            x: event.clientX - canvasBounds.left,
            y: event.clientY - canvasBounds.top,
        };
        setIsPointerOnField(true);
    };

    const handlePointerLeave = () => {
        targetPositionRef.current = null;
        setIsPointerOnField(false);
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
                aria-label="Hra s krajtou, veďte ji myší za body"
                role="img"
            />
            {!isPointerOnField && (
                <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-white/50">
                    Veďte krajtu myší nebo prstem.
                </p>
            )}
        </div>
    );
}
