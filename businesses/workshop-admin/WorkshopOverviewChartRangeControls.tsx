'use client';

import { Button } from '@/components/ui/button';
import {
    getMovedWorkshopOverviewRange,
    getZoomedWorkshopOverviewRange,
    isWorkshopOverviewRangeMovableLeft,
    isWorkshopOverviewRangeMovableRight,
    isWorkshopOverviewRangeZoomableIn,
    isWorkshopOverviewRangeZoomableOut,
} from '@/lib/workshops/workshopOverviewRangeNavigation';
import type { WorkshopOverviewSeriesRange } from '@/lib/workshops/workshopOverviewSeriesPoints';
import { ChevronLeft, ChevronRight, Maximize2, Target, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react';

type WorkshopOverviewChartRangeControlsProps = {
    readonly range: WorkshopOverviewSeriesRange;
    readonly fullRange: WorkshopOverviewSeriesRange;
    readonly onZoomChange: (range: WorkshopOverviewSeriesRange) => void;

    /**
     * Returns to the time the room is held at, or null in a room which is not held at one and therefore has no span
     * of its own to return to.
     */
    readonly onZoomToSchedule: (() => void) | null;
};

const MOVE_LEFT_LABEL = 'Doleva';
const MOVE_RIGHT_LABEL = 'Doprava';
const ZOOM_IN_LABEL = 'Přiblížit';
const ZOOM_OUT_LABEL = 'Oddálit';

type WorkshopOverviewChartRangeButtonProps = {
    readonly label: string;
    readonly Icon: LucideIcon;
    readonly isDisabled?: boolean;
    readonly onClick: () => void;
};

/**
 * One consistently sized action in the graph controls, large enough to be used with a finger as well as a pointer.
 */
function WorkshopOverviewChartRangeButton({
    label,
    Icon,
    isDisabled = false,
    onClick,
}: WorkshopOverviewChartRangeButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11 gap-1.5 px-3"
            disabled={isDisabled}
            onClick={onClick}
        >
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
        </Button>
    );
}

/**
 * The discrete time navigation of the overview graph, kept separate from its filters so it can give both mouse and
 * touch users the same bounded zoom and move actions.
 */
export function WorkshopOverviewChartRangeControls({
    range,
    fullRange,
    onZoomChange,
    onZoomToSchedule,
}: WorkshopOverviewChartRangeControlsProps) {
    const isZoomInDisabled = !isWorkshopOverviewRangeZoomableIn(range, fullRange);
    const isZoomOutDisabled = !isWorkshopOverviewRangeZoomableOut(range, fullRange);
    const isMoveLeftDisabled = !isWorkshopOverviewRangeMovableLeft(range, fullRange);
    const isMoveRightDisabled = !isWorkshopOverviewRangeMovableRight(range, fullRange);

    return (
        <div className="flex flex-wrap gap-2">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Přiblížení grafu">
                <WorkshopOverviewChartRangeButton
                    label={ZOOM_IN_LABEL}
                    Icon={ZoomIn}
                    isDisabled={isZoomInDisabled}
                    onClick={() => onZoomChange(getZoomedWorkshopOverviewRange(range, fullRange, 'in'))}
                />
                <WorkshopOverviewChartRangeButton
                    label={ZOOM_OUT_LABEL}
                    Icon={ZoomOut}
                    isDisabled={isZoomOutDisabled}
                    onClick={() => onZoomChange(getZoomedWorkshopOverviewRange(range, fullRange, 'out'))}
                />
            </div>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Posun grafu">
                <WorkshopOverviewChartRangeButton
                    label={MOVE_LEFT_LABEL}
                    Icon={ChevronLeft}
                    isDisabled={isMoveLeftDisabled}
                    onClick={() => onZoomChange(getMovedWorkshopOverviewRange(range, fullRange, 'left'))}
                />
                <WorkshopOverviewChartRangeButton
                    label={MOVE_RIGHT_LABEL}
                    Icon={ChevronRight}
                    isDisabled={isMoveRightDisabled}
                    onClick={() => onZoomChange(getMovedWorkshopOverviewRange(range, fullRange, 'right'))}
                />
            </div>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Rozsah grafu">
                {onZoomToSchedule !== null && (
                    <WorkshopOverviewChartRangeButton
                        label="Čas workshopu"
                        Icon={Target}
                        onClick={onZoomToSchedule}
                    />
                )}
                <WorkshopOverviewChartRangeButton
                    label="Vše"
                    Icon={Maximize2}
                    isDisabled={isZoomOutDisabled}
                    onClick={() => onZoomChange(fullRange)}
                />
            </div>
        </div>
    );
}
