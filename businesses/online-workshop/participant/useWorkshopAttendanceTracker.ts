'use client';

import {
    isWorkshopAttendanceActive,
    WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES,
} from '@/lib/workshops/workshopAttendance';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Watches whether somebody is really at the computer which has the room open
 *
 * Note: Nothing is kept in the state of the room, because every interaction would otherwise redraw the whole chat and
 *       the stage. The moment of the last interaction is only ever read when a presence heartbeat is about to be sent.
 * Note: The moment the room is opened counts as an interaction of its own, because entering it is one: somebody just
 *       filled in the connection form or clicked their way in.
 */
export function useWorkshopAttendanceTracker(): () => boolean {
    const lastInteractionAtMillisecondsReference = useRef<number | null>(null);

    useEffect(() => {
        lastInteractionAtMillisecondsReference.current = Date.now();

        const rememberInteraction = () => {
            lastInteractionAtMillisecondsReference.current = Date.now();
        };

        // Note: The events are caught on their way down to whatever was interacted with, because scrolling the chat
        //       or the materials never travels back up to the window on its own.
        const listenerOptions = { passive: true, capture: true } as const;
        for (const eventName of WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES) {
            window.addEventListener(eventName, rememberInteraction, listenerOptions);
        }

        return () => {
            for (const eventName of WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES) {
                window.removeEventListener(eventName, rememberInteraction, listenerOptions);
            }
        };
    }, []);

    return useCallback(
        () => isWorkshopAttendanceActive(lastInteractionAtMillisecondsReference.current, Date.now()),
        [],
    );
}
