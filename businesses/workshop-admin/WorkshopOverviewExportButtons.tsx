'use client';

import { Button } from '@/components/ui/button';
import { downloadBlobFile } from '@/lib/downloadBlobFile';
import { downloadTextFile } from '@/lib/downloadTextFile';
import { renderChartAsPdfBlob, renderChartAsPngBlob, serializeChartAsSvg } from '@/lib/exports/svgChartExport';
import type { WorkshopOverviewSeriesDescriptor } from '@/lib/workshops/workshopOverviewSeries';
import { serializeWorkshopOverviewSeriesAsCsv } from '@/lib/workshops/workshopOverviewCsv';
import type { WorkshopOverviewSeriesPoint } from '@/lib/workshops/workshopOverviewSeriesPoints';
import { Download } from 'lucide-react';
import { useState } from 'react';

/**
 * The files one graph can be taken away as, in the order of how often an administrator asks for them
 */
const WORKSHOP_OVERVIEW_EXPORT_FORMATS = ['CSV', 'SVG', 'PNG', 'PDF'] as const;

type WorkshopOverviewExportFormat = (typeof WORKSHOP_OVERVIEW_EXPORT_FORMATS)[number];

type WorkshopOverviewExportButtonsProps = {
    readonly workshopSlug: string;
    readonly points: readonly WorkshopOverviewSeriesPoint[];
    readonly descriptors: readonly WorkshopOverviewSeriesDescriptor[];
    readonly getChartElement: () => SVGSVGElement | null;
};

/**
 * Take the graph away as a picture or as the numbers it is drawn from
 *
 * Note: Every file says exactly what is on the screen, the zoom, the switched on lines and the written metrics
 *       included, so a shared link and a downloaded file always show the same thing.
 */
export function WorkshopOverviewExportButtons({
    workshopSlug,
    points,
    descriptors,
    getChartElement,
}: WorkshopOverviewExportButtonsProps) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const exportGraph = async (exportFormat: WorkshopOverviewExportFormat) => {
        const fileName = `${workshopSlug}-graf.${exportFormat.toLowerCase()}`;
        const exportOptions = { title: `Přehled workshopu ${workshopSlug}` };

        try {
            setErrorMessage(null);

            if (exportFormat === 'CSV') {
                downloadTextFile({
                    fileName,
                    mimeType: 'text/csv;charset=utf-8',
                    content: serializeWorkshopOverviewSeriesAsCsv(points, descriptors),
                });
                return;
            }

            const chartElement = getChartElement();
            if (chartElement === null) {
                throw new Error('Graf ještě není vykreslený');
            }

            if (exportFormat === 'SVG') {
                downloadTextFile({
                    fileName,
                    mimeType: 'image/svg+xml;charset=utf-8',
                    content: serializeChartAsSvg(chartElement, exportOptions),
                });
                return;
            }

            const blob =
                exportFormat === 'PNG'
                    ? await renderChartAsPngBlob(chartElement, exportOptions)
                    : await renderChartAsPdfBlob(chartElement, exportOptions);

            downloadBlobFile({ fileName, blob });
        } catch (error) {
            setErrorMessage((error as Error).message);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
                {WORKSHOP_OVERVIEW_EXPORT_FORMATS.map((exportFormat) => (
                    <Button
                        key={exportFormat}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void exportGraph(exportFormat)}
                    >
                        <Download className="mr-1.5 h-4 w-4" /> {exportFormat}
                    </Button>
                ))}
            </div>
            {errorMessage !== null && <p className="text-xs text-rose-600">{errorMessage}</p>}
        </div>
    );
}
