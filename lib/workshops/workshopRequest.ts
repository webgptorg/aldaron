import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopBySlug,
    getWorkshopDatabaseOrNull,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import { authenticateWorkshopParticipant } from '@/lib/workshops/workshopSession';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export type AuthenticatedWorkshopRequest = {
    readonly supabase: SupabaseClient;
    readonly workshopRow: WorkshopRow;
    readonly participant: WorkshopParticipant;
};

export async function getAuthenticatedWorkshopRequest(
    request: NextRequest,
    workshopSlug: string,
): Promise<AuthenticatedWorkshopRequest | NextResponse> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return createWorkshopDatabaseUnavailableResponse();
    }

    const workshopRow = await findWorkshopBySlug(supabase, workshopSlug, true);
    if (workshopRow === null) {
        return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const participant = await authenticateWorkshopParticipant(supabase, request, workshopRow.id, workshopRow.slug);
    if (participant === null) {
        return NextResponse.json({ error: 'Workshop connection required' }, { status: 401 });
    }

    return { supabase, workshopRow, participant };
}

export function isAuthenticatedWorkshopRequest(
    value: AuthenticatedWorkshopRequest | NextResponse,
): value is AuthenticatedWorkshopRequest {
    return !(value instanceof NextResponse);
}
