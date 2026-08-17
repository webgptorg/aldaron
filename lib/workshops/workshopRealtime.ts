import { getWorkshopRealtimeTopic, WORKSHOP_REALTIME_EVENT_NAME } from '@/lib/workshops/workshopConstants';
import type { WorkshopRealtimeEvent } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Send a private, server-authored event. Persistence remains the source of truth;
 * a failed broadcast is harmless because clients periodically refresh as a fallback.
 */
export async function broadcastWorkshopEvent(
    supabase: SupabaseClient,
    workshopSlug: string,
    event: WorkshopRealtimeEvent,
): Promise<void> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return;
    }

    const channel = supabase.channel(getWorkshopRealtimeTopic(workshopSlug), { config: { private: true } });

    try {
        await supabase.realtime.setAuth(serviceRoleKey);
        await channel.httpSend(WORKSHOP_REALTIME_EVENT_NAME, event);
    } catch (error) {
        console.error('Failed to broadcast a workshop change:', error);
    } finally {
        await supabase.removeChannel(channel);
    }
}
