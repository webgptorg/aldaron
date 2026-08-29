/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useSynchronizedHorizontalScroll } from './useSynchronizedHorizontalScroll';

function SynchronizedHorizontalScrollTestComponent() {
    const { firstScrollContainerRef, secondScrollContainerRef, handleFirstScroll, handleSecondScroll } =
        useSynchronizedHorizontalScroll();

    return (
        <>
            <div ref={firstScrollContainerRef} data-testid="first-scroll-container" onScroll={handleFirstScroll} />
            <div ref={secondScrollContainerRef} data-testid="second-scroll-container" onScroll={handleSecondScroll} />
        </>
    );
}

describe('useSynchronizedHorizontalScroll', () => {
    it('keeps both scroll containers at the same horizontal position', () => {
        render(<SynchronizedHorizontalScrollTestComponent />);

        const firstScrollContainer = screen.getByTestId('first-scroll-container');
        const secondScrollContainer = screen.getByTestId('second-scroll-container');

        firstScrollContainer.scrollLeft = 240;
        fireEvent.scroll(firstScrollContainer);

        expect(secondScrollContainer.scrollLeft).toBe(240);

        secondScrollContainer.scrollLeft = 120;
        fireEvent.scroll(secondScrollContainer);

        expect(firstScrollContainer.scrollLeft).toBe(120);
    });
});
