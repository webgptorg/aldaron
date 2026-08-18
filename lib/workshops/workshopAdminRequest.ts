import {
    createWorkshopDatabaseUnavailableResponse,
    findWorkshopById,
    getWorkshopDatabaseOrNull,
    type WorkshopRow,
} from '@/lib/workshops/workshopDatabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type AdminWorkshopData = {
    readonly supabase: SupabaseClient;
    readonly workshopRow: WorkshopRow;
};

export async function getAdminWorkshopDataOrResponse(
    workshopId: string,
): Promise<AdminWorkshopData | { readonly response: NextResponse }> {
    const supabase = getWorkshopDatabaseOrNull();
    if (supabase === null) {
        return { response: createWorkshopDatabaseUnavailableResponse() };
    }

    const workshopRow = await findWorkshopById(supabase, workshopId);
    return workshopRow === null
        ? { response: NextResponse.json({ error: 'Workshop not found' }, { status: 404 }) }
        : { supabase, workshopRow };
}
