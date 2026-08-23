import { serializeRowsAsCsv, type CsvColumn } from '@/lib/exports/serializeRowsAsCsv';
import type { WorkshopOverviewSeriesDescriptor } from '@/lib/workshops/workshopOverviewSeries';
import type { WorkshopOverviewSeriesPoint } from '@/lib/workshops/workshopOverviewSeriesPoints';

/**
 * Write down exactly what the graph draws: one row per point of time and one column per line which is switched on
 *
 * Note: The moment is written as a full timestamp rather than as the hour a reader sees on the axis, so that a
 *       spreadsheet keeps the day and the time zone the number belongs to.
 */
export function serializeWorkshopOverviewSeriesAsCsv(
    points: readonly WorkshopOverviewSeriesPoint[],
    descriptors: readonly WorkshopOverviewSeriesDescriptor[],
): string {
    const columns: readonly CsvColumn<WorkshopOverviewSeriesPoint>[] = [
        { header: 'Začátek úseku', getValue: (point) => new Date(point.startsAtMilliseconds).toISOString() },
        ...descriptors.map((descriptor): CsvColumn<WorkshopOverviewSeriesPoint> => ({
            header: descriptor.label,
            getValue: (point) => point.values[descriptor.id] ?? 0,
        })),
    ];

    return serializeRowsAsCsv(points, columns);
}
