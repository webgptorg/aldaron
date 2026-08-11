/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useSynchronizedHorizontalScroll } from './useSynchronizedHorizontalScroll';

function SynchronizedHorizontalScrollTestComponent() {
    const { topScrollContainerRef, bottomScrollContainerRef, handleTopScroll, handleBottomScroll } =
        useSynchronizedHorizontalScroll();

    return (
        <>
            <div ref={topScrollContainerRef} data-testid="top-scroll-container" onScroll={handleTopScroll} />
            <div ref={bottomScrollContainerRef} data-testid="bottom-scroll-container" onScroll={handleBottomScroll} />
        </>
    );
}

describe('useSynchronizedHorizontalScroll', () => {
    it('keeps the top and bottom scroll containers at the same horizontal position', () => {
        render(<SynchronizedHorizontalScrollTestComponent />);

        const topScrollContainer = screen.getByTestId('top-scroll-container');
        const bottomScrollContainer = screen.getByTestId('bottom-scroll-container');

        topScrollContainer.scrollLeft = 240;
        fireEvent.scroll(topScrollContainer);

        expect(bottomScrollContainer.scrollLeft).toBe(240);

        bottomScrollContainer.scrollLeft = 120;
        fireEvent.scroll(bottomScrollContainer);

        expect(topScrollContainer.scrollLeft).toBe(120);
    });
});
