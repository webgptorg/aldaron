import type { WorkshopOverviewSeriesDescriptor } from '@/lib/workshops/workshopOverviewSeries';

/**
 * The colour of a line which is switched off, so that a legend still lists it without claiming to draw it
 */
const SWITCHED_OFF_SERIES_COLOR = '#c3c2b7';

const SWATCH_WIDTH_PIXELS = 18;
const SWATCH_HEIGHT_PIXELS = 6;
const SWATCH_STROKE_WIDTH_PIXELS = 2;

type WorkshopOverviewSeriesSwatchProps = {
    readonly descriptor: WorkshopOverviewSeriesDescriptor;

    /**
     * Whether the graph really draws this line right now
     */
    readonly isVisible?: boolean;
};

/**
 * The piece of a line which stands next to its name, drawn exactly as the graph draws that line
 *
 * Note: The dashes are a part of the identity of a line, not a decoration of the chart, because the two attendances
 *       share the colour of the audience they are a part of. A legend which drew them all as one solid colour would
 *       therefore name three lines the reader could not tell apart.
 */
export function WorkshopOverviewSeriesSwatch({ descriptor, isVisible = true }: WorkshopOverviewSeriesSwatchProps) {
    return (
        <svg
            aria-hidden="true"
            className="shrink-0"
            width={SWATCH_WIDTH_PIXELS}
            height={SWATCH_HEIGHT_PIXELS}
            viewBox={`0 0 ${SWATCH_WIDTH_PIXELS} ${SWATCH_HEIGHT_PIXELS}`}
        >
            <line
                x1={0}
                y1={SWATCH_HEIGHT_PIXELS / 2}
                x2={SWATCH_WIDTH_PIXELS}
                y2={SWATCH_HEIGHT_PIXELS / 2}
                stroke={isVisible ? descriptor.color : SWITCHED_OFF_SERIES_COLOR}
                strokeWidth={SWATCH_STROKE_WIDTH_PIXELS}
                strokeLinecap="round"
                strokeDasharray={descriptor.dashPattern ?? undefined}
            />
        </svg>
    );
}
