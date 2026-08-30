import {
    WORKSHOP_SUBMISSION_STATUS_VALUES,
    type WorkshopCommentStatus,
    type WorkshopSubmissionStatus,
} from '@/lib/workshops/workshopTypes';

export function isWorkshopCommentStatus(value: string | null): value is WorkshopCommentStatus {
    return value !== null && WORKSHOP_SUBMISSION_STATUS_VALUES.includes(value as WorkshopSubmissionStatus);
}
