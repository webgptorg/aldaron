'use client';

import { useCallback, useRef, type RefObject, type UIEvent } from 'react';

type UseSynchronizedHorizontalScrollResult = {
    readonly firstScrollContainerRef: RefObject<HTMLDivElement | null>;
    readonly secondScrollContainerRef: RefObject<HTMLDivElement | null>;
    readonly handleFirstScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
    readonly handleSecondScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
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
 * Keep any two horizontal scroll containers in sync.
 */
export function useSynchronizedHorizontalScroll(): UseSynchronizedHorizontalScrollResult {
    const firstScrollContainerRef = useRef<HTMLDivElement>(null);
    const secondScrollContainerRef = useRef<HTMLDivElement>(null);

    const handleFirstScroll = useCallback((scrollEvent: UIEvent<HTMLDivElement>) => {
        copyHorizontalScrollPosition(scrollEvent.currentTarget, secondScrollContainerRef.current);
    }, []);

    const handleSecondScroll = useCallback((scrollEvent: UIEvent<HTMLDivElement>) => {
        copyHorizontalScrollPosition(scrollEvent.currentTarget, firstScrollContainerRef.current);
    }, []);

    return { firstScrollContainerRef, secondScrollContainerRef, handleFirstScroll, handleSecondScroll };
}
