import { WORKSHOP_SUBMISSION_STATUS_VALUES, type WorkshopSubmissionStatus } from '@/lib/workshops/workshopTypes';

/**
 * Recognizes the shared moderation lifecycle of a participant submission without tying project routes to chat-only
 * naming.
 */
export function isWorkshopSubmissionStatus(value: string | null): value is WorkshopSubmissionStatus {
    return value !== null && WORKSHOP_SUBMISSION_STATUS_VALUES.includes(value as WorkshopSubmissionStatus);
}
