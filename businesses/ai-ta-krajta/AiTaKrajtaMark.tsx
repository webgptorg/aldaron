'use client';

import {
    AI_TA_KRAJTA_MARK_GRADIENT,
    AI_TA_KRAJTA_MARK_SHAPES,
    AI_TA_KRAJTA_MARK_STROKE_LINE_CAP,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
    createAiTaKrajtaMarkPaintValue,
    type AiTaKrajtaMarkShape,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { cn } from '@/lib/utils';
import { useId } from 'react';

/**
 * One drawn part of the snake, as an SVG element
 */
function AiTaKrajtaMarkShapeElement({
    shape,
    gradientId,
}: {
    readonly shape: AiTaKrajtaMarkShape;
    readonly gradientId: string;
}) {
    const paintValue = createAiTaKrajtaMarkPaintValue(shape.paint, gradientId);

    if (shape.kind === 'filledPath') {
        return <path d={shape.pathData} fill={paintValue} />;
    }

    if (shape.kind === 'strokedPath') {
        return (
            <path
                d={shape.pathData}
                stroke={paintValue}
                strokeWidth={shape.strokeWidth}
                strokeLinecap={AI_TA_KRAJTA_MARK_STROKE_LINE_CAP}
                fill="none"
            />
        );
    }

    return (
        <ellipse
            cx={shape.centerX}
            cy={shape.centerY}
            rx={shape.radiusX}
            ry={shape.radiusY}
            transform={`rotate(${shape.rotationInDegrees} ${shape.centerX} ${shape.centerY})`}
            fill={paintValue}
        />
    );
}

/**
 * The snake of the show, drawn the way the cover artwork draws it
 *
 * Note: It is a drawing rather than the cover image, so it can sit on any background, scale to a favicon and be the
 *       thing the game in the header uncoils from.
 */
export function AiTaKrajtaMark({ className }: { readonly className?: string }) {
    const gradientId = useId();

    return (
        <svg
            aria-hidden="true"
            viewBox={`0 0 ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE} ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}`}
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1={AI_TA_KRAJTA_MARK_GRADIENT.x1}
                    y1={AI_TA_KRAJTA_MARK_GRADIENT.y1}
                    x2={AI_TA_KRAJTA_MARK_GRADIENT.x2}
                    y2={AI_TA_KRAJTA_MARK_GRADIENT.y2}
                    gradientUnits="userSpaceOnUse"
                >
                    {AI_TA_KRAJTA_MARK_GRADIENT.stops.map((stop) => (
                        <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
                    ))}
                </linearGradient>
            </defs>

            {AI_TA_KRAJTA_MARK_SHAPES.map((shape) => (
                <AiTaKrajtaMarkShapeElement key={shape.id} shape={shape} gradientId={gradientId} />
            ))}
        </svg>
    );
}
