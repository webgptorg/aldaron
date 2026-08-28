/**
 * Whether somebody who has the room open is really attending it
 *
 * A room can only ever observe two things about the person who opened it: that the page is theirs to see, and that
 * they touch their computer. Somebody who moves a mouse, types, scrolls or touches the screen is in front of it and
 * attends the workshop actively; somebody whose room has been open without a single one of those has most probably
 * left it running and attends it passively. This module is the one place which decides that, so the room, the request
 * it sends and the graph which draws it all mean the same thing by an active participant.
 */

/**
 * How long after somebody last touched their computer they still count as actively attending
 *
 * Note: This is deliberately longer than the interval a room reports its presence in, so that reading a slide without
 *       moving a hand for half a minute never makes an attentive participant passive. It is short enough that somebody
 *       who walked away is recognized within the very next reports.
 */
export const WORKSHOP_ACTIVE_ATTENDANCE_WINDOW_SECONDS = 120;

/**
 * Everything a browser tells a page about a person being at their computer
 *
 * Note: A pointer which only moves, a key which is only pressed and a page which is only scrolled all count, because
 *       none of them reaches the server on its own and all of them mean somebody is there. Every one of them is
 *       listened to passively, so watching for attendance never delays a scroll or a tap.
 */
export const WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES = [
    'pointerdown',
    'pointermove',
    'keydown',
    'wheel',
    'scroll',
    'touchstart',
] as const;

/**
 * Was this participant at their computer, as far as the room could tell at this moment?
 *
 * Note: Somebody who has never interacted at all is passive, so a room left open in a background window before a
 *       single movement counts as the passive audience it is.
 */
export function isWorkshopAttendanceActive(
    lastInteractionAtMilliseconds: number | null,
    currentMilliseconds: number,
): boolean {
    if (lastInteractionAtMilliseconds === null) {
        return false;
    }

    return currentMilliseconds - lastInteractionAtMilliseconds <= WORKSHOP_ACTIVE_ATTENDANCE_WINDOW_SECONDS * 1_000;
}
