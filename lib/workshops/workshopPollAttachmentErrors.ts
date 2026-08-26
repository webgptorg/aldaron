import { NextResponse } from 'next/server';

/**
 * What the database says when a poll is attached to something which is not an existing workshop occurrence
 */
const WORKSHOP_POLL_ATTACHMENT_ERROR_MESSAGES = ['WORKSHOP_POLL_WORKSHOP_INVALID', 'WORKSHOP_POLL_WORKSHOPS_INVALID'];
const FOREIGN_KEY_VIOLATION_ERROR_CODE = '23503';

type WorkshopPollDatabaseError = {
    readonly code?: string;
    readonly message?: string;
} | null;

/**
 * Answers an impossible attachment as the administrator's mistake it is.
 *
 * Note: Creating and changing a poll write their attachments through the very same database rules, so they also refuse
 *       an impossible one the very same way rather than each reporting an internal failure of its own.
 */
export function getWorkshopPollAttachmentErrorResponseOrNull(error: WorkshopPollDatabaseError): NextResponse | null {
    if (error === null || error === undefined) {
        return null;
    }

    const isAttachmentError =
        WORKSHOP_POLL_ATTACHMENT_ERROR_MESSAGES.includes(error.message ?? '') ||
        error.code === FOREIGN_KEY_VIOLATION_ERROR_CODE;

    return isAttachmentError
        ? NextResponse.json({ error: 'Poll can only be attached to existing workshops' }, { status: 400 })
        : null;
}
