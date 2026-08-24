import type { WorkshopProjectStatus } from '@/lib/workshops/workshopTypes';

export const WORKSHOP_PROJECT_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

/**
 * Whether a stored project status is one the room knows how to present.
 */
export function isWorkshopProjectStatus(value: string | null): value is WorkshopProjectStatus {
    return value !== null && WORKSHOP_PROJECT_STATUS_VALUES.includes(value as WorkshopProjectStatus);
}

/**
 * One Czech label shared by the member gallery and the administration, so a status never says something different
 * depending on who happens to be reading it.
 */
export function getWorkshopProjectStatusLabel(status: WorkshopProjectStatus): string {
    switch (status) {
        case 'pending':
            return 'Čeká na schválení';
        case 'approved':
            return 'Schváleno';
        case 'rejected':
            return 'Neschváleno';
    }
}

/**
 * A compact, safe label for a validated public project link.
 */
export function getWorkshopProjectLinkLabel(projectUrl: string): string {
    try {
        return new URL(projectUrl).hostname.replace(/^www\./, '');
    } catch {
        return projectUrl;
    }
}
