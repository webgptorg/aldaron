import type { WorkshopCommentStatus } from '@/lib/workshops/workshopTypes';

const WORKSHOP_COMMENT_STATUSES = ['pending', 'approved', 'rejected'] as const;

export function isWorkshopCommentStatus(value: string | null): value is WorkshopCommentStatus {
    return value !== null && WORKSHOP_COMMENT_STATUSES.includes(value as WorkshopCommentStatus);
}
