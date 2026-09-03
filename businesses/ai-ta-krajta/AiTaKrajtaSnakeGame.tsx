'use client';

import {
    advanceSnakeState,
    createSnakeState,
    getSnakeSegments,
    type SnakeBounds,
    type SnakePoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';
import {
    drawAiTaKrajtaSnakeBody,
    drawAiTaKrajtaSnakeEyes,
    drawAiTaKrajtaSnakeFood,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeCanvas';
import {
    AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME,
    getAiTaKrajtaMarkFrameScale,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { createAiTaKrajtaSnakeLogoPose } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeLogoPose';
import { useEffect, useRef, useState, type PointerEvent } from 'react';

/**
 * How long the snake takes to come out of the pose of the logo and swim at its own speed
 *
 * Note: Its first drawn frame is the logo, down to the pixel, because both are the same drawing of the same animal.
 *       Nothing is therefore faded into anything; the animal simply starts to move, and this is how long it takes to
 *       get up to speed while its eyes open and its food is laid out around it.
 */
const AWAKENING_DURATION_IN_MILLISECONDS = 900;

/**
 * Restricts an animation progress to its meaningful range
 */
function clampProgress(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * How far the snake has come out of the pose of the logo, easing so that it neither jerks nor crawls
 */
function getAwakeningRatio(elapsedInMilliseconds: number): number {
    const progress = clampProgress(elapsedInMilliseconds / AWAKENING_DURATION_IN_MILLISECONDS);

    return progress * progress * (3 - 2 * progress);
}

/**
 * The snake of the logo, let loose
 *
 * Note: It moves freely rather than jumping from square to square, so it steers the way a snake in a browser game
 *       does. The whole game is `aiTaKrajtaSnakeSimulation` and the whole animal is `aiTaKrajtaSnakeBody`; this only
 *       runs the one over the other and feeds the pointer into it.
 */
export function AiTaKrajtaSnakeGame({
    initialMarkFrame,
    onInitialMarkFrameDrawn,
}: {
    readonly initialMarkFrame: AiTaKrajtaMarkFrame;
    readonly onInitialMarkFrameDrawn: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetPositionRef = useRef<SnakePoint | null>(null);
    const [score, setScore] = useState(0);
    const [isSnakeAwake, setIsSnakeAwake] = useState(false);

    useEffect(() => {
        const wakeUpTimeout = window.setTimeout(() => setIsSnakeAwake(true), AWAKENING_DURATION_IN_MILLISECONDS);

        return () => window.clearTimeout(wakeUpTimeout);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d') ?? null;

        if (canvas === null || context === null) {
            return;
        }

        let bounds: SnakeBounds = { width: canvas.clientWidth, height: canvas.clientHeight };
        let lastFrameTimestamp: number | null = null;
        let gameStartTimestamp: number | null = null;
        let animationFrameId = 0;
        let isInitialMarkFrameDrawn = false;

        const resizeCanvas = () => {
            const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);

            bounds = { width: canvas.clientWidth, height: canvas.clientHeight };
            canvas.width = Math.max(1, Math.round(bounds.width * devicePixelRatio));
            canvas.height = Math.max(1, Math.round(bounds.height * devicePixelRatio));
            context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        };

        resizeCanvas();

        const halfWidthScale = getAiTaKrajtaMarkFrameScale(initialMarkFrame);
        let state = createSnakeState(bounds, Math.random, createAiTaKrajtaSnakeLogoPose(initialMarkFrame));

        const renderFrame = (frameTimestamp: number) => {
            const stepInSeconds = lastFrameTimestamp === null ? 0 : (frameTimestamp - lastFrameTimestamp) / 1000;
            lastFrameTimestamp = frameTimestamp;
            gameStartTimestamp ??= frameTimestamp;
            const awakeningRatio = getAwakeningRatio(frameTimestamp - gameStartTimestamp);

            const previousScore = state.score;
            state = advanceSnakeState(state, {
                bounds,
                targetPosition: targetPositionRef.current,
                stepInSeconds: stepInSeconds * awakeningRatio,
                createRandomNumber: Math.random,
            });

            if (state.score !== previousScore) {
                setScore(state.score);
            }

            context.clearRect(0, 0, bounds.width, bounds.height);
            drawAiTaKrajtaSnakeFood(context, state.food, halfWidthScale, awakeningRatio);
            drawAiTaKrajtaSnakeBody(context, getSnakeSegments(state), halfWidthScale);
            drawAiTaKrajtaSnakeEyes(
                context,
                state.headPosition,
                state.headAngleInRadians,
                halfWidthScale,
                awakeningRatio,
            );

            if (!isInitialMarkFrameDrawn) {
                isInitialMarkFrameDrawn = true;
                onInitialMarkFrameDrawn();
            }

            animationFrameId = window.requestAnimationFrame(renderFrame);
        };

        animationFrameId = window.requestAnimationFrame(renderFrame);

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [initialMarkFrame, onInitialMarkFrameDrawn]);

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
                className={`h-full w-full cursor-crosshair touch-none ${AI_TA_KRAJTA_MARK_SHADOW_CLASS_NAME}`}
                aria-label="Krajta, veďte ji myší nebo prstem"
                role="img"
            />
            <output
                aria-live="polite"
                className={`pointer-events-none absolute right-4 top-4 rounded-full border border-white/20 bg-[#101916]/80 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-opacity duration-700 ${
                    isSnakeAwake ? 'opacity-100' : 'opacity-0'
                }`}
            >
                Skóre: {score}
            </output>
        </div>
    );
}
