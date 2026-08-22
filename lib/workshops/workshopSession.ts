import { readClientIpAddress } from '@/lib/api/readClientIpAddress';
import {
    MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH,
    WORKSHOP_PARTICIPANT_TABLE_NAME,
    WORKSHOP_SESSION_TOKEN_BYTES,
    getWorkshopSessionCookieName,
} from '@/lib/workshops/workshopConstants';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';

export type WorkshopParticipantRow = {
    readonly id: string;
    readonly fullname: string;
    readonly connected_at: string;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
    readonly is_moderator: boolean;
};

/**
 * Columns every query needs to describe a participant to the room, deliberately without their personal contact details
 */
export const WORKSHOP_PARTICIPANT_COLUMNS =
    'id, fullname, connected_at, is_interaction_banned, is_trusted, is_moderator';

export function createWorkshopSessionToken(): string {
    return randomBytes(WORKSHOP_SESSION_TOKEN_BYTES).toString('base64url');
}

export function hashWorkshopSessionToken(sessionToken: string): string {
    return createHash('sha256').update(sessionToken, 'utf8').digest('hex');
}

export function readWorkshopSessionToken(request: NextRequest, workshopSlug: string): string | null {
    return request.cookies.get(getWorkshopSessionCookieName(workshopSlug))?.value ?? null;
}

export function mapWorkshopParticipantRow(row: WorkshopParticipantRow): WorkshopParticipant {
    return {
        id: row.id,
        fullname: row.fullname,
        connectedAt: row.connected_at,
        isInteractionBanned: row.is_interaction_banned,
        isTrusted: row.is_trusted,
        isModerator: row.is_moderator,
    };
}

export async function createWorkshopParticipant(
    supabase: SupabaseClient,
    request: NextRequest,
    workshopId: string,
    fullname: string,
    email: string,
): Promise<{ readonly participant: WorkshopParticipant; readonly sessionToken: string } | null> {
    const sessionToken = createWorkshopSessionToken();
    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .insert({
            workshop_id: workshopId,
            fullname,
            email,
            session_token_hash: hashWorkshopSessionToken(sessionToken),
            ip_address: readClientIpAddress(request),
            user_agent: request.headers.get('user-agent')?.slice(0, MAXIMAL_WORKSHOP_PARTICIPANT_USER_AGENT_LENGTH),
        })
        .select(WORKSHOP_PARTICIPANT_COLUMNS)
        .single();

    if (error || data === null) {
        console.error('Failed to connect a workshop participant:', error?.message ?? 'No participant returned');
        return null;
    }

    return { participant: mapWorkshopParticipantRow(data as WorkshopParticipantRow), sessionToken };
}

export async function authenticateWorkshopParticipant(
    supabase: SupabaseClient,
    request: NextRequest,
    workshopId: string,
    workshopSlug: string,
): Promise<WorkshopParticipant | null> {
    const sessionToken = readWorkshopSessionToken(request, workshopSlug);

    if (!sessionToken) {
        return null;
    }

    const { data, error } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .select(WORKSHOP_PARTICIPANT_COLUMNS)
        .eq('workshop_id', workshopId)
        .eq('session_token_hash', hashWorkshopSessionToken(sessionToken))
        .maybeSingle();

    if (error) {
        console.error('Failed to authenticate a workshop participant:', error.message);
        return null;
    }

    if (data === null) {
        return null;
    }

    const { error: activityError } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', data.id)
        .eq('workshop_id', workshopId);
    if (activityError) {
        console.error('Failed to update workshop participant activity:', activityError.message);
    }

    return mapWorkshopParticipantRow(data as WorkshopParticipantRow);
}
