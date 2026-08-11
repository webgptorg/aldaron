/**
 * How much time is left, already split into the numbers a countdown shows
 */
export type CountdownParts = {
    readonly remainingMilliseconds: number;
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;

    /**
     * Whether the awaited moment already came
     */
    readonly isElapsed: boolean;
};

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

/**
 * Split the time between the two moments into days, hours, minutes and seconds
 *
 * Note: Once the awaited moment passes, everything is zero and `isElapsed` is `true`, so the countdown never counts
 *       into negative numbers.
 */
export function getCountdownParts(targetTime: Date, currentTime: Date): CountdownParts {
    const remainingMilliseconds = Math.max(0, targetTime.getTime() - currentTime.getTime());
    const remainingSeconds = Math.floor(remainingMilliseconds / MILLISECONDS_IN_SECOND);

    return {
        remainingMilliseconds,
        days: Math.floor(remainingSeconds / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY)),
        hours: Math.floor(remainingSeconds / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)) % HOURS_IN_DAY,
        minutes: Math.floor(remainingSeconds / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR,
        seconds: remainingSeconds % SECONDS_IN_MINUTE,
        isElapsed: remainingMilliseconds === 0,
    };
}

/**
 * Write one number of the countdown always with two digits, so the countdown does not jump as the numbers shrink
 */
export function formatCountdownNumber(value: number): string {
    return String(value).padStart(2, '0');
}
