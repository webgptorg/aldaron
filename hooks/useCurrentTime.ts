'use client';

import { useEffect, useState } from 'react';

/**
 * Current moment, refreshed in the given rhythm
 *
 * Note: It stays `null` until the component really runs in the browser, because a clock rendered on the server would
 *       already be wrong by the time it reaches the browser and React would complain about the difference.
 */
export function useCurrentTime(refreshIntervalMs: number): Date | null {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());

        const intervalId = setInterval(() => setCurrentTime(new Date()), refreshIntervalMs);

        return () => clearInterval(intervalId);
    }, [refreshIntervalMs]);

    return currentTime;
}
