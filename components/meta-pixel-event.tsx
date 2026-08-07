'use client';

import { trackMetaPixelEvent } from '@/lib/tracking/track-meta-pixel-event';
import { useEffect } from 'react';

type MetaPixelEventProps = {
    /**
     * Name of a Meta standard event, for example `CompleteRegistration`
     */
    eventName: string;
};

/**
 * Reports one standard Meta Pixel event when the page which renders it is opened
 *
 * Note: It renders nothing, it exists only to let a server rendered page declare its conversion event.
 */
export function MetaPixelEvent({ eventName }: MetaPixelEventProps) {
    useEffect(() => trackMetaPixelEvent(eventName), [eventName]);

    return null;
}
