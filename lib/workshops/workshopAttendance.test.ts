import {
    isWorkshopAttendanceActive,
    WORKSHOP_ACTIVE_ATTENDANCE_WINDOW_SECONDS,
    WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES,
} from '@/lib/workshops/workshopAttendance';
import { describe, expect, it } from 'vitest';

const NOW_MILLISECONDS = Date.parse('2026-08-23T10:30:00.000Z');
const WINDOW_MILLISECONDS = WORKSHOP_ACTIVE_ATTENDANCE_WINDOW_SECONDS * 1_000;

describe('isWorkshopAttendanceActive', () => {
    it('counts somebody who has just touched their computer as actively attending', () => {
        expect(isWorkshopAttendanceActive(NOW_MILLISECONDS, NOW_MILLISECONDS)).toBe(true);
    });

    it('keeps somebody who is only watching without moving inside the window active', () => {
        expect(isWorkshopAttendanceActive(NOW_MILLISECONDS - WINDOW_MILLISECONDS, NOW_MILLISECONDS)).toBe(true);
    });

    it('counts a room which has been open without a single interaction as passively attended', () => {
        expect(isWorkshopAttendanceActive(NOW_MILLISECONDS - WINDOW_MILLISECONDS - 1_000, NOW_MILLISECONDS)).toBe(
            false,
        );
    });

    it('counts a room nobody has ever interacted with as passively attended', () => {
        expect(isWorkshopAttendanceActive(null, NOW_MILLISECONDS)).toBe(false);
    });

    it('waits longer than the room reports its presence in, so a quiet half minute never turns anybody passive', () => {
        expect(WORKSHOP_ACTIVE_ATTENDANCE_WINDOW_SECONDS).toBeGreaterThan(60);
    });

    it('watches for a movement, a keystroke and a touch alike', () => {
        expect(WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES).toContain('pointermove');
        expect(WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES).toContain('keydown');
        expect(WORKSHOP_ATTENDANCE_INTERACTION_EVENT_NAMES).toContain('touchstart');
    });
});
