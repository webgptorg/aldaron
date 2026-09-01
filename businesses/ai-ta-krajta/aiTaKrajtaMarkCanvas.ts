import {
    AI_TA_KRAJTA_MARK_GRADIENT,
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_STROKE_LINE_CAP,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    type AiTaKrajtaMarkFrame,
    type AiTaKrajtaMarkPaint,
    type AiTaKrajtaMarkShapeId,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';

/**
 * Creates the same user-space gradient which the SVG mark uses
 */
function createAiTaKrajtaMarkCanvasGradient(context: CanvasRenderingContext2D): CanvasGradient {
    const gradient = context.createLinearGradient(
        AI_TA_KRAJTA_MARK_GRADIENT.x1,
        AI_TA_KRAJTA_MARK_GRADIENT.y1,
        AI_TA_KRAJTA_MARK_GRADIENT.x2,
        AI_TA_KRAJTA_MARK_GRADIENT.y2,
    );

    for (const stop of AI_TA_KRAJTA_MARK_GRADIENT.stops) {
        gradient.addColorStop(stop.offset, stop.color);
    }

    return gradient;
}

/**
 * Resolves one artwork paint into a canvas paint
 */
function getAiTaKrajtaMarkCanvasPaint(
    paint: AiTaKrajtaMarkPaint,
    gradient: CanvasGradient,
): string | CanvasGradient {
    return paint.kind === 'gradient' ? gradient : paint.color;
}

/**
 * Draws the canonical vector mark into a canvas at its original proportions
 *
 * Note: This is a renderer for the same artwork data used by the React SVG and favicon SVG. Keeping the data shared
 *       lets the canvas keep the logo visible while its simulated version uncoils.
 */
export function drawAiTaKrajtaMarkOnCanvas(
    context: CanvasRenderingContext2D,
    frame: AiTaKrajtaMarkFrame,
    opacity: number,
    shapeIds?: readonly AiTaKrajtaMarkShapeId[],
): void {
    if (opacity <= 0) {
        return;
    }

    context.save();
    context.globalAlpha = opacity;
    context.translate(frame.left, frame.top);
    context.scale(
        frame.width / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
        frame.height / AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    );

    const gradient = createAiTaKrajtaMarkCanvasGradient(context);

    for (const shape of AI_TA_KRAJTA_MARK_SHAPES) {
        const isShapeIncluded = shapeIds === undefined || shapeIds.includes(shape.id);

        if (!isShapeIncluded) {
            continue;
        }

        context.fillStyle = getAiTaKrajtaMarkCanvasPaint(shape.paint, gradient);

        if (shape.kind === 'filledPath') {
            context.fill(new Path2D(shape.pathData));
            continue;
        }

        if (shape.kind === 'strokedPath') {
            context.strokeStyle = getAiTaKrajtaMarkCanvasPaint(shape.paint, gradient);
            context.lineWidth = shape.strokeWidth;
            context.lineCap = AI_TA_KRAJTA_MARK_STROKE_LINE_CAP;
            context.stroke(new Path2D(shape.pathData));
            continue;
        }

        context.save();
        context.translate(shape.centerX, shape.centerY);
        context.rotate((shape.rotationInDegrees * Math.PI) / 180);
        context.beginPath();
        context.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

    context.restore();
}
