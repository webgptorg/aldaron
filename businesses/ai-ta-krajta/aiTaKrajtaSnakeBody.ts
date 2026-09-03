import {
    getAiTaKrajtaSnakeColor,
    getAiTaKrajtaSnakeHalfWidth,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBodyProfile';

/**
 * One point of the centre line the animal is built around
 */
export type AiTaKrajtaSnakeBodyPoint = {
    readonly x: number;
    readonly y: number;
};

/**
 * The rectangle a drawn animal occupies
 */
export type AiTaKrajtaSnakeBodyBounds = {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
};

/**
 * One drawn piece of the animal, as a short stroke of its own thickness and colour
 *
 * Note: It is described as data rather than as markup, so that the same animal can be turned into React elements for
 *       the page, into a standalone SVG document for the icon of the browser tab and into a canvas the game moves.
 */
export type AiTaKrajtaSnakeBodySlice = {
    readonly id: string;
    readonly pathData: string;
    readonly color: string;
    readonly strokeWidth: number;
};

/**
 * Ends of every piece of the animal are round, which is what rounds its head and the tip of its tail and what lets
 * two neighbouring pieces meet without a seam or a corner
 */
export const AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP = 'round';

/**
 * How many pieces the animal is drawn with
 *
 * Note: The thickness and the colour run along the body rather than across the picture, which no single stroke and no
 *       gradient of a browser can do. The body is therefore cut into enough pieces for the step between two of them to
 *       stay well under a pixel at the size of an icon.
 */
const BODY_SLICE_COUNT = 96;

/**
 * How finely one curved piece of the centre line is measured before the body is spread evenly along it
 */
const SAMPLES_PER_CENTER_LINE_PIECE = 8;

/**
 * Decimal places kept in generated path data, which at the size of an icon is far below one pixel
 */
const PATH_DATA_DECIMAL_PLACES = 2;

function getDistance(firstPoint: AiTaKrajtaSnakeBodyPoint, secondPoint: AiTaKrajtaSnakeBodyPoint): number {
    return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function interpolatePoints(
    firstPoint: AiTaKrajtaSnakeBodyPoint,
    secondPoint: AiTaKrajtaSnakeBodyPoint,
    ratio: number,
): AiTaKrajtaSnakeBodyPoint {
    return {
        x: firstPoint.x + (secondPoint.x - firstPoint.x) * ratio,
        y: firstPoint.y + (secondPoint.y - firstPoint.y) * ratio,
    };
}

/**
 * One point of the curve which bends through a corner of the centre line
 */
function evaluateQuadraticCurve(
    startPoint: AiTaKrajtaSnakeBodyPoint,
    controlPoint: AiTaKrajtaSnakeBodyPoint,
    endPoint: AiTaKrajtaSnakeBodyPoint,
    curveFraction: number,
): AiTaKrajtaSnakeBodyPoint {
    const remaining = 1 - curveFraction;
    const startWeight = remaining * remaining;
    const controlWeight = 2 * remaining * curveFraction;
    const endWeight = curveFraction * curveFraction;

    return {
        x: startPoint.x * startWeight + controlPoint.x * controlWeight + endPoint.x * endWeight,
        y: startPoint.y * startWeight + controlPoint.y * controlWeight + endPoint.y * endWeight,
    };
}

/**
 * Rounds the corners of a centre line by running it through the middle of each of its pieces
 *
 * Note: This is the one place a centre line is smoothed, so the mark, its icon and the moving game all bend the
 *       animal in exactly the same way whether they hand over twenty authored points or a remembered trail.
 */
export function smoothAiTaKrajtaSnakeCenterLine(
    centerLine: readonly AiTaKrajtaSnakeBodyPoint[],
): readonly AiTaKrajtaSnakeBodyPoint[] {
    const firstPoint = centerLine[0];
    const lastPoint = centerLine[centerLine.length - 1];

    if (firstPoint === undefined || lastPoint === undefined || centerLine.length < 3) {
        return [...centerLine];
    }

    const smoothedPoints: AiTaKrajtaSnakeBodyPoint[] = [firstPoint];

    for (let pointIndex = 1; pointIndex < centerLine.length - 1; pointIndex++) {
        const startPoint = smoothedPoints[smoothedPoints.length - 1];
        const controlPoint = centerLine[pointIndex];
        const followingPoint = centerLine[pointIndex + 1];

        if (startPoint === undefined || controlPoint === undefined || followingPoint === undefined) {
            continue;
        }

        const endPoint = interpolatePoints(controlPoint, followingPoint, 0.5);

        for (let sampleIndex = 1; sampleIndex <= SAMPLES_PER_CENTER_LINE_PIECE; sampleIndex++) {
            smoothedPoints.push(
                evaluateQuadraticCurve(startPoint, controlPoint, endPoint, sampleIndex / SAMPLES_PER_CENTER_LINE_PIECE),
            );
        }
    }

    smoothedPoints.push(lastPoint);

    return smoothedPoints;
}

/**
 * Spreads a fixed number of evenly spaced points along a line, so that a position along the animal always means the
 * same share of its length
 */
function spreadEvenlyAlongLine(
    points: readonly AiTaKrajtaSnakeBodyPoint[],
    stationCount: number,
): readonly AiTaKrajtaSnakeBodyPoint[] {
    const cumulativeDistances = [0];

    for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
        const previousPoint = points[pointIndex - 1];
        const currentPoint = points[pointIndex];

        cumulativeDistances.push(
            (cumulativeDistances[pointIndex - 1] ?? 0) +
                (previousPoint === undefined || currentPoint === undefined
                    ? 0
                    : getDistance(previousPoint, currentPoint)),
        );
    }

    const totalDistance = cumulativeDistances[cumulativeDistances.length - 1] ?? 0;
    const spreadPoints: AiTaKrajtaSnakeBodyPoint[] = [];
    let pointIndex = 1;

    for (let stationIndex = 0; stationIndex <= stationCount; stationIndex++) {
        const wantedDistance = (totalDistance * stationIndex) / stationCount;

        while (pointIndex < points.length - 1 && (cumulativeDistances[pointIndex] ?? 0) < wantedDistance) {
            pointIndex++;
        }

        const previousPoint = points[pointIndex - 1];
        const currentPoint = points[pointIndex];
        const previousDistance = cumulativeDistances[pointIndex - 1] ?? 0;
        const pieceDistance = (cumulativeDistances[pointIndex] ?? 0) - previousDistance;

        if (previousPoint === undefined || currentPoint === undefined) {
            continue;
        }

        spreadPoints.push(
            pieceDistance === 0
                ? currentPoint
                : interpolatePoints(previousPoint, currentPoint, (wantedDistance - previousDistance) / pieceDistance),
        );
    }

    return spreadPoints;
}

/**
 * The evenly spaced points the pieces of the animal are strung between
 */
function createBodyStations(
    centerLine: readonly AiTaKrajtaSnakeBodyPoint[],
): readonly AiTaKrajtaSnakeBodyPoint[] {
    return spreadEvenlyAlongLine(smoothAiTaKrajtaSnakeCenterLine(centerLine), BODY_SLICE_COUNT);
}

function formatPathNumber(value: number): string {
    return Number(value.toFixed(PATH_DATA_DECIMAL_PLACES)).toString();
}

function formatPathPoint(point: AiTaKrajtaSnakeBodyPoint): string {
    return `${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`;
}

/**
 * The snake of the show, cut into the pieces it is drawn with
 *
 * Note: The pieces run from the tip of the tail up to the head, so that wherever the animal crosses itself the part
 *       nearer its head lies on top. This is what puts the coil of the mark over its own tail and its head over
 *       everything, and it is what keeps a moving snake readable once it curls up.
 *
 * Note: Each piece is a round-ended stroke rather than a slab cut across the body. The mark coils tighter than it is
 *       thick, which turns the inner edge of any such slab inside out; round ends have no inner edge to lose.
 *
 * @param centerLine the line the body is built around, head first
 * @param halfWidthScale how much thicker the animal is drawn than the mark measures it
 */
export function createAiTaKrajtaSnakeBodySlices(
    centerLine: readonly AiTaKrajtaSnakeBodyPoint[],
    halfWidthScale: number,
): readonly AiTaKrajtaSnakeBodySlice[] {
    if (centerLine.length < 2) {
        return [];
    }

    const stations = createBodyStations(centerLine);
    const slices: AiTaKrajtaSnakeBodySlice[] = [];

    for (let sliceIndex = BODY_SLICE_COUNT - 1; sliceIndex >= 0; sliceIndex--) {
        const station = stations[sliceIndex];
        const followingStation = stations[sliceIndex + 1];
        const bodyFraction = sliceIndex / BODY_SLICE_COUNT;

        if (station === undefined || followingStation === undefined) {
            continue;
        }

        slices.push({
            id: `body-${sliceIndex}`,
            pathData: `M${formatPathPoint(station)}L${formatPathPoint(followingStation)}`,
            color: getAiTaKrajtaSnakeColor(bodyFraction),
            strokeWidth: getAiTaKrajtaSnakeHalfWidth(bodyFraction) * halfWidthScale * 2,
        });
    }

    return slices;
}

/**
 * The rectangle the drawn animal really occupies, which is what puts it in the middle of an icon
 */
export function getAiTaKrajtaSnakeBodyBounds(
    centerLine: readonly AiTaKrajtaSnakeBodyPoint[],
    halfWidthScale: number,
): AiTaKrajtaSnakeBodyBounds {
    const stations = createBodyStations(centerLine);
    const halfWidths = stations.map(
        (_, stationIndex) =>
            getAiTaKrajtaSnakeHalfWidth(Math.min(stationIndex, BODY_SLICE_COUNT - 1) / BODY_SLICE_COUNT) *
            halfWidthScale,
    );

    return {
        left: Math.min(...stations.map((station, index) => station.x - (halfWidths[index] ?? 0))),
        top: Math.min(...stations.map((station, index) => station.y - (halfWidths[index] ?? 0))),
        right: Math.max(...stations.map((station, index) => station.x + (halfWidths[index] ?? 0))),
        bottom: Math.max(...stations.map((station, index) => station.y + (halfWidths[index] ?? 0))),
    };
}
