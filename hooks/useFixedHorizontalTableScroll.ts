'use client';

import { useCallback, useEffect, useRef, useState, type RefObject, type UIEvent } from 'react';
import { useSynchronizedHorizontalScroll } from './useSynchronizedHorizontalScroll';

const HORIZONTAL_OVERFLOW_TOLERANCE_PIXELS = 1;

type FixedHorizontalScrollbarState = {
    readonly isVisible: boolean;
    readonly leftPixels: number;
    readonly widthPixels: number;
    readonly contentWidthPixels: number;
};

type UseFixedHorizontalTableScrollResult = {
    readonly tableScrollContainerRef: RefObject<HTMLDivElement | null>;
    readonly fixedScrollbarRef: RefObject<HTMLDivElement | null>;
    readonly fixedHorizontalScrollbarState: FixedHorizontalScrollbarState;
    readonly handleTableScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
    readonly handleFixedScrollbarScroll: (scrollEvent: UIEvent<HTMLDivElement>) => void;
};

const HIDDEN_FIXED_HORIZONTAL_SCROLLBAR_STATE: FixedHorizontalScrollbarState = {
    isVisible: false,
    leftPixels: 0,
    widthPixels: 0,
    contentWidthPixels: 0,
};

function getFixedHorizontalScrollbarState(scrollContainer: HTMLDivElement): FixedHorizontalScrollbarState {
    const scrollContainerBounds = scrollContainer.getBoundingClientRect();
    const isHorizontallyOverflowing =
        scrollContainer.scrollWidth > scrollContainer.clientWidth + HORIZONTAL_OVERFLOW_TOLERANCE_PIXELS;
    const isScrollContainerVisible = scrollContainerBounds.top < window.innerHeight && scrollContainerBounds.bottom > 0;
    const leftPixels = Math.max(0, scrollContainerBounds.left);
    const rightPixels = Math.min(window.innerWidth, scrollContainerBounds.right);
    const widthPixels = Math.max(0, rightPixels - leftPixels);

    if (!isHorizontallyOverflowing || !isScrollContainerVisible || widthPixels === 0) {
        return HIDDEN_FIXED_HORIZONTAL_SCROLLBAR_STATE;
    }

    return {
        isVisible: true,
        leftPixels,
        widthPixels,
        contentWidthPixels: Math.ceil(scrollContainer.scrollWidth),
    };
}

function isFixedHorizontalScrollbarStateEqual(
    firstState: FixedHorizontalScrollbarState,
    secondState: FixedHorizontalScrollbarState,
): boolean {
    return (
        firstState.isVisible === secondState.isVisible &&
        firstState.leftPixels === secondState.leftPixels &&
        firstState.widthPixels === secondState.widthPixels &&
        firstState.contentWidthPixels === secondState.contentWidthPixels
    );
}

/**
 * Keeps a table's wide content scrollable from a bar fixed at the viewport bottom while that table is on screen.
 */
export function useFixedHorizontalTableScroll(): UseFixedHorizontalTableScrollResult {
    const {
        firstScrollContainerRef: fixedScrollbarRef,
        secondScrollContainerRef: tableScrollContainerRef,
        handleFirstScroll: handleFixedScrollbarScroll,
        handleSecondScroll: handleTableScroll,
    } = useSynchronizedHorizontalScroll();
    const [fixedHorizontalScrollbarState, setFixedHorizontalScrollbarState] = useState<FixedHorizontalScrollbarState>(
        HIDDEN_FIXED_HORIZONTAL_SCROLLBAR_STATE,
    );
    const resizeObserverReference = useRef<ResizeObserver | null>(null);

    const updateFixedHorizontalScrollbar = useCallback(() => {
        const tableScrollContainer = tableScrollContainerRef.current;

        if (tableScrollContainer === null) {
            return;
        }

        const nextFixedHorizontalScrollbarState = getFixedHorizontalScrollbarState(tableScrollContainer);

        setFixedHorizontalScrollbarState((currentFixedHorizontalScrollbarState) =>
            isFixedHorizontalScrollbarStateEqual(currentFixedHorizontalScrollbarState, nextFixedHorizontalScrollbarState)
                ? currentFixedHorizontalScrollbarState
                : nextFixedHorizontalScrollbarState,
        );
    }, [tableScrollContainerRef]);

    useEffect(() => {
        updateFixedHorizontalScrollbar();
    });

    useEffect(() => {
        const tableScrollContainer = tableScrollContainerRef.current;

        if (tableScrollContainer === null) {
            return;
        }

        window.addEventListener('resize', updateFixedHorizontalScrollbar);
        window.addEventListener('scroll', updateFixedHorizontalScrollbar, true);

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(updateFixedHorizontalScrollbar);
            resizeObserver.observe(tableScrollContainer);

            const tableElement = tableScrollContainer.querySelector('table');
            if (tableElement !== null) {
                resizeObserver.observe(tableElement);
            }

            resizeObserverReference.current = resizeObserver;
        }

        return () => {
            window.removeEventListener('resize', updateFixedHorizontalScrollbar);
            window.removeEventListener('scroll', updateFixedHorizontalScrollbar, true);
            resizeObserverReference.current?.disconnect();
            resizeObserverReference.current = null;
        };
    }, [tableScrollContainerRef, updateFixedHorizontalScrollbar]);

    useEffect(() => {
        const tableScrollContainer = tableScrollContainerRef.current;
        const fixedScrollbar = fixedScrollbarRef.current;

        if (fixedHorizontalScrollbarState.isVisible && tableScrollContainer !== null && fixedScrollbar !== null) {
            fixedScrollbar.scrollLeft = tableScrollContainer.scrollLeft;
        }
    }, [fixedHorizontalScrollbarState.isVisible, fixedScrollbarRef, tableScrollContainerRef]);

    return {
        tableScrollContainerRef,
        fixedScrollbarRef,
        fixedHorizontalScrollbarState,
        handleTableScroll,
        handleFixedScrollbarScroll,
    };
}
