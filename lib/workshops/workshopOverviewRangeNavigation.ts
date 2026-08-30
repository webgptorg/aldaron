import type { WorkshopOverviewSeriesRange } from '@/lib/workshops/workshopOverviewSeriesPoints';

/**
 * How much one zoom action changes the visible time span.
 */
export const WORKSHOP_OVERVIEW_ZOOM_FACTOR = 0.2;

/**
 * How much one move action shifts the visible time span.
 *
 * Note: Moving by half the current span keeps an overlap between two neighbouring views, so the person reading the
 *       graph keeps their bearings while moving through a long history.
 */
export const WORKSHOP_OVERVIEW_MOVE_FACTOR = 0.5;

/**
 * The shortest span the graph can show, so that repeated zooming never arrives at one unhelpful instant.
 */
export const MINIMAL_WORKSHOP_OVERVIEW_RANGE_MILLISECONDS = 60_000;

export type WorkshopOverviewMoveDirection = 'left' | 'right';
export type WorkshopOverviewZoomDirection = 'in' | 'out';

function getRangeDurationMilliseconds(range: WorkshopOverviewSeriesRange): number {
    return Math.max(0, range.toMilliseconds - range.fromMilliseconds);
}

function getMinimalRangeDurationMilliseconds(fullRange: WorkshopOverviewSeriesRange): number {
    return Math.min(MINIMAL_WORKSHOP_OVERVIEW_RANGE_MILLISECONDS, getRangeDurationMilliseconds(fullRange));
}

function getRangeFromMilliseconds(range: WorkshopOverviewSeriesRange, fullRange: WorkshopOverviewSeriesRange): number {
    return Number.isFinite(range.fromMilliseconds) ? range.fromMilliseconds : fullRange.fromMilliseconds;
}

/**
 * Keeps a requested window inside the full measured window while retaining as much of its duration as possible.
 */
export function clampWorkshopOverviewRange(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): WorkshopOverviewSeriesRange {
    const fullRangeDurationMilliseconds = getRangeDurationMilliseconds(fullRange);
    const requestedRangeDurationMilliseconds = getRangeDurationMilliseconds(range);
    const rangeDurationMilliseconds = Math.round(
        Math.min(
            fullRangeDurationMilliseconds,
            Math.max(getMinimalRangeDurationMilliseconds(fullRange), requestedRangeDurationMilliseconds),
        ),
    );
    const maximumFromMilliseconds = fullRange.toMilliseconds - rangeDurationMilliseconds;
    const fromMilliseconds = Math.round(
        Math.min(
            maximumFromMilliseconds,
            Math.max(fullRange.fromMilliseconds, getRangeFromMilliseconds(range, fullRange)),
        ),
    );

    return {
        fromMilliseconds,
        toMilliseconds: fromMilliseconds + rangeDurationMilliseconds,
    };
}

/**
 * Zooms the visible range around one relative point, which keeps the point under a mouse wheel in place.
 */
export function getZoomedWorkshopOverviewRange(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
    zoomDirection: WorkshopOverviewZoomDirection,
    focusFraction: number = 0.5,
): WorkshopOverviewSeriesRange {
    const boundedRange = clampWorkshopOverviewRange(range, fullRange);
    const boundedFocusFraction = Math.min(1, Math.max(0, focusFraction));
    const rangeDurationMilliseconds = getRangeDurationMilliseconds(boundedRange);
    const zoomedRangeDurationMilliseconds =
        rangeDurationMilliseconds *
        (zoomDirection === 'in' ? 1 - WORKSHOP_OVERVIEW_ZOOM_FACTOR : 1 + WORKSHOP_OVERVIEW_ZOOM_FACTOR);
    const focusMilliseconds =
        boundedRange.fromMilliseconds + rangeDurationMilliseconds * boundedFocusFraction;

    return clampWorkshopOverviewRange(
        {
            fromMilliseconds: focusMilliseconds - zoomedRangeDurationMilliseconds * boundedFocusFraction,
            toMilliseconds:
                focusMilliseconds + zoomedRangeDurationMilliseconds * (1 - boundedFocusFraction),
        },
        fullRange,
    );
}

/**
 * Moves the current window by half of its duration while keeping it inside the measured data.
 */
export function getMovedWorkshopOverviewRange(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
    moveDirection: WorkshopOverviewMoveDirection,
): WorkshopOverviewSeriesRange {
    const boundedRange = clampWorkshopOverviewRange(range, fullRange);
    const moveMilliseconds = Math.round(getRangeDurationMilliseconds(boundedRange) * WORKSHOP_OVERVIEW_MOVE_FACTOR);
    const movementMultiplier = moveDirection === 'left' ? -1 : 1;

    return clampWorkshopOverviewRange(
        {
            fromMilliseconds: boundedRange.fromMilliseconds + moveMilliseconds * movementMultiplier,
            toMilliseconds: boundedRange.toMilliseconds + moveMilliseconds * movementMultiplier,
        },
        fullRange,
    );
}

/**
 * Whether the current range can still be made smaller.
 */
export function isWorkshopOverviewRangeZoomableIn(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): boolean {
    return (
        getRangeDurationMilliseconds(clampWorkshopOverviewRange(range, fullRange)) >
        getMinimalRangeDurationMilliseconds(fullRange)
    );
}

/**
 * Whether the current range does not already show all measured data.
 */
export function isWorkshopOverviewRangeZoomableOut(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): boolean {
    const boundedRange = clampWorkshopOverviewRange(range, fullRange);

    return (
        boundedRange.fromMilliseconds > fullRange.fromMilliseconds ||
        boundedRange.toMilliseconds < fullRange.toMilliseconds
    );
}

/**
 * Whether the current range has earlier measured data left to show.
 */
export function isWorkshopOverviewRangeMovableLeft(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): boolean {
    return clampWorkshopOverviewRange(range, fullRange).fromMilliseconds > fullRange.fromMilliseconds;
}

/**
 * Whether the current range has later measured data left to show.
 */
export function isWorkshopOverviewRangeMovableRight(
    range: WorkshopOverviewSeriesRange,
    fullRange: WorkshopOverviewSeriesRange,
): boolean {
    return clampWorkshopOverviewRange(range, fullRange).toMilliseconds < fullRange.toMilliseconds;
}
