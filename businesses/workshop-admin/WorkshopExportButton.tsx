'use client';

import { buildAdminWorkshopExportUrl } from '@/businesses/workshop-admin/workshopAdminApiClient';
import { Button } from '@/components/ui/button';
import type { WorkshopAdminExportKind } from '@/lib/workshops/workshopAdminExports';
import type { WorkshopAdminParticipantQuery } from '@/lib/workshops/workshopAdminParticipantQuery';
import { Download } from 'lucide-react';

type WorkshopExportButtonProps = {
    readonly workshopId: string;
    readonly exportKind: WorkshopAdminExportKind;
    readonly label: string;
    readonly participantQuery?: WorkshopAdminParticipantQuery;
};

/**
 * A regular download link styled as a button, so a browser can stream a large export without keeping it in React state.
 */
export function WorkshopExportButton({ workshopId, exportKind, label, participantQuery }: WorkshopExportButtonProps) {
    const exportUrl = buildAdminWorkshopExportUrl(workshopId, exportKind, participantQuery);

    return (
        <Button asChild type="button" variant="outline" size="sm">
            <a href={exportUrl}>
                <Download className="mr-1.5 h-4 w-4" /> {label}
            </a>
        </Button>
    );
}
