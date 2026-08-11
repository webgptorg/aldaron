'use client';

import { useCallback, useRef, type RefObject, type UIEvent } from 'react';

type UseSynchronizedHorizontalScrollResult = {
    readonly topScrollContainerRef: RefObject<HTMLDivElement | null>;
    readonly bottomScrollContainerRef: RefObject<HTMLDivElement | null>;
    readonly handleTopScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
    readonly handleBottomScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
};

/**
 * Copy one horizontal scroll position to its companion container
 */
function copyHorizontalScrollPosition(sourceElement: HTMLElement, destinationElement: HTMLElement | null): void {
    if (destinationElement === null || destinationElement.scrollLeft === sourceElement.scrollLeft) {
        return;
    }

    destinationElement.scrollLeft = sourceElement.scrollLeft;
}

/**
 * Keep the horizontal scrollbars placed above and below the same content in sync
 */
export function useSynchronizedHorizontalScroll(): UseSynchronizedHorizontalScrollResult {
    const topScrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomScrollContainerRef = useRef<HTMLDivElement>(null);

    const handleTopScroll = useCallback((scrollEvent: UIEvent<HTMLDivElement>) => {
        copyHorizontalScrollPosition(scrollEvent.currentTarget, bottomScrollContainerRef.current);
    }, []);

    const handleBottomScroll = useCallback((scrollEvent: UIEvent<HTMLDivElement>) => {
        copyHorizontalScrollPosition(scrollEvent.currentTarget, topScrollContainerRef.current);
    }, []);

    return { topScrollContainerRef, bottomScrollContainerRef, handleTopScroll, handleBottomScroll };
}
