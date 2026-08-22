import { getWorkshopRealtimeTopic, WORKSHOP_REALTIME_EVENT_NAME } from '@/lib/workshops/workshopConstants';
import { getWorkshopKindCapabilities } from '@/lib/workshops/workshopKindCapabilities';
import type { WorkshopKind, WorkshopRealtimeEvent } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * As much of a room as a broadcast needs: the topic it belongs to and whether anybody in it listens at all
 */
type BroadcastingWorkshopRoom = {
    readonly room_kind: WorkshopKind;
    readonly slug: string;
};

/**
 * Send a private, server-authored event. Persistence remains the source of truth;
 * a failed broadcast is harmless because clients periodically refresh as a fallback.
 *
 * Note: A room which does not update itself live opens no channel, so nothing is sent to it. That keeps a write in a
 *       calm room from waiting for a broadcast which nobody would receive.
 */
export async function broadcastWorkshopEvent(
    supabase: SupabaseClient,
    workshopRoom: BroadcastingWorkshopRoom,
    event: WorkshopRealtimeEvent,
): Promise<void> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || !getWorkshopKindCapabilities(workshopRoom.room_kind).isRealtime) {
        return;
    }

    const channel = supabase.channel(getWorkshopRealtimeTopic(workshopRoom.slug), { config: { private: true } });

    try {
        await supabase.realtime.setAuth(serviceRoleKey);
        await channel.httpSend(WORKSHOP_REALTIME_EVENT_NAME, event);
    } catch (error) {
        console.error('Failed to broadcast a workshop change:', error);
    } finally {
        await supabase.removeChannel(channel);
    }
}
