/**
 * The one form of a participant address used to decide durable identity across rooms.
 */
export function normalizeWorkshopParticipantEmail(email: string): string {
    return email.trim().toLowerCase();
}
