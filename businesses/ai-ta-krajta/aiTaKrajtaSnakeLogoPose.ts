import {
    AI_TA_KRAJTA_MARK_CENTER_LINE,
    placeAiTaKrajtaMarkPointInFrame,
    type AiTaKrajtaMarkFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import {
    smoothAiTaKrajtaSnakeCenterLine,
    type AiTaKrajtaSnakeBodyPoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import {
    SEGMENT_DISTANCE_IN_PIXELS,
    TRAIL_POINT_DISTANCE_IN_PIXELS,
    type SnakeInitialPose,
    type SnakePoint,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeSimulation';

/**
 * Distance between two points of the logo's centre line
 */
function getDistance(firstPoint: AiTaKrajtaSnakeBodyPoint, secondPoint: AiTaKrajtaSnakeBodyPoint): number {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

/**
 * Adds points at the same spacing the game remembers its trail with
 */
function createEvenlySpacedTrail(points: readonly AiTaKrajtaSnakeBodyPoint[]): SnakePoint[] {
    const firstPoint = points[0];

    if (firstPoint === undefined) {
        return [];
    }

    const trail: SnakePoint[] = [{ x: firstPoint.x, y: firstPoint.y }];
    let distanceUntilNextPoint = TRAIL_POINT_DISTANCE_IN_PIXELS;

    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
        const previousPoint = points[pointIndex - 1];
        const nextPoint = points[pointIndex];

        if (previousPoint === undefined || nextPoint === undefined) {
            continue;
        }

        const segmentDistance = getDistance(previousPoint, nextPoint);

        if (segmentDistance === 0) {
            continue;
        }

        let distanceFromPreviousPoint = distanceUntilNextPoint;

        while (distanceFromPreviousPoint <= segmentDistance) {
            const ratio = distanceFromPreviousPoint / segmentDistance;

            trail.push({
                x: previousPoint.x + (nextPoint.x - previousPoint.x) * ratio,
                y: previousPoint.y + (nextPoint.y - previousPoint.y) * ratio,
            });
            distanceFromPreviousPoint += TRAIL_POINT_DISTANCE_IN_PIXELS;
        }

        distanceUntilNextPoint = distanceFromPreviousPoint - segmentDistance;
    }

    const lastPoint = points[points.length - 1];

    if (lastPoint !== undefined) {
        trail.push({ x: lastPoint.x, y: lastPoint.y });
    }

    return trail;
}

/**
 * How many segments a body needs for its last one to fall on the last remembered point of its trail
 *
 * Note: A playing snake carries a couple of remembered points more than it draws, because its trail is trimmed a
 *       whole segment at a time. A snake standing in the pose of the logo may not: were it to stop two points short,
 *       the tip of the tail of the logo would be missing from the very frame which has to be the logo.
 */
function getSegmentCountReachingTrailEnd(trailLength: number): number {
    const trailPointsPerSegment = SEGMENT_DISTANCE_IN_PIXELS / TRAIL_POINT_DISTANCE_IN_PIXELS;

    return Math.max(2, Math.ceil((trailLength - 1) / trailPointsPerSegment) + 1);
}

/**
 * Creates the initial simulation pose from the exact frame occupied by the static logo
 *
 * Note: The trail is laid along the very curve the mark is drawn along, rounded corners and all, rather than along the
 *       handful of points that curve is written with. The body the game then draws out of that trail therefore falls
 *       on the logo instead of cutting its corners, which is what lets the logo become the snake without a fade.
 */
export function createAiTaKrajtaSnakeLogoPose(frame: AiTaKrajtaMarkFrame): SnakeInitialPose {
    const points = smoothAiTaKrajtaSnakeCenterLine(AI_TA_KRAJTA_MARK_CENTER_LINE).map((point) =>
        placeAiTaKrajtaMarkPointInFrame(point, frame),
    );
    const trail = createEvenlySpacedTrail(points);
    const headPosition = trail[0];
    const pointBehindHead = trail[1];

    if (headPosition === undefined || pointBehindHead === undefined) {
        throw new Error('The AI ta Krajta mark needs at least two spine points.');
    }

    return {
        headPosition,
        headAngleInRadians: Math.atan2(headPosition.y - pointBehindHead.y, headPosition.x - pointBehindHead.x),
        trail,
        segmentCount: getSegmentCountReachingTrailEnd(trail.length),
    };
}
