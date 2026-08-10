'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Width in pixels of every column, keyed by the column key
 */
export type ColumnWidths = Readonly<Record<string, number>>;

type UseResizableColumnWidthsOptions = {
    readonly defaultWidths: ColumnWidths;
    readonly minimalWidth: number;
    readonly maximalWidth: number;

    /**
     * Key under which the widths survive a reload of the page
     */
    readonly storageKey: string;
};

type UseResizableColumnWidthsResult = {
    readonly widths: ColumnWidths;
    readonly isResizing: boolean;

    /**
     * Start dragging the right edge of one column, to be called from `onPointerDown` of the resize handle
     */
    readonly startResizing: (columnKey: string, pointerEvent: { readonly clientX: number }) => void;

    /**
     * Throw the manually dragged widths away and go back to the default ones
     */
    readonly resetWidths: () => void;
};

type ActiveResize = {
    readonly columnKey: string;
    readonly startClientX: number;
    readonly startWidth: number;
};

/**
 * Read the widths remembered from the previous visit
 */
function readStoredWidths(storageKey: string): ColumnWidths | null {
    try {
        const storedWidths = window.localStorage.getItem(storageKey);

        if (storedWidths === null) {
            return null;
        }

        const parsedWidths = JSON.parse(storedWidths) as unknown;

        if (typeof parsedWidths !== 'object' || parsedWidths === null) {
            return null;
        }

        return parsedWidths as ColumnWidths;
    } catch (error) {
        console.warn(`Column widths stored under "${storageKey}" could not be read`, error);
        return null;
    }
}

/**
 * Remember the widths for the next visit
 */
function writeStoredWidths(storageKey: string, widths: ColumnWidths): void {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(widths));
    } catch (error) {
        console.warn(`Column widths could not be stored under "${storageKey}"`, error);
    }
}

/**
 * Keep only the numeric widths of the columns which still exist
 */
function sanitizeStoredWidths(storedWidths: ColumnWidths, defaultWidths: ColumnWidths): ColumnWidths {
    const sanitizedWidths: Record<string, number> = {};

    for (const columnKey of Object.keys(defaultWidths)) {
        const storedWidth = storedWidths[columnKey];

        if (typeof storedWidth === 'number' && Number.isFinite(storedWidth) && storedWidth > 0) {
            sanitizedWidths[columnKey] = storedWidth;
        }
    }

    return sanitizedWidths;
}

/**
 * Widths of table columns which the user can change by dragging the right edge of the column header
 *
 * The widths are remembered in the local storage, so the table stays as the user set it up
 */
export function useResizableColumnWidths(options: UseResizableColumnWidthsOptions): UseResizableColumnWidthsResult {
    const { defaultWidths, minimalWidth, maximalWidth, storageKey } = options;

    const [widths, setWidths] = useState<ColumnWidths>(defaultWidths);
    const [activeResize, setActiveResize] = useState<ActiveResize | null>(null);

    // Note: The pointer handlers need the current widths without being re-subscribed on every single pixel of a drag
    const latestWidthsRef = useRef<ColumnWidths>(defaultWidths);

    const applyWidths = useCallback((nextWidths: ColumnWidths) => {
        latestWidthsRef.current = nextWidths;
        setWidths(nextWidths);
    }, []);

    useEffect(() => {
        const storedWidths = readStoredWidths(storageKey);

        if (storedWidths !== null) {
            applyWidths({ ...defaultWidths, ...sanitizeStoredWidths(storedWidths, defaultWidths) });
        }
    }, [storageKey, defaultWidths, applyWidths]);

    const startResizing = useCallback((columnKey: string, pointerEvent: { readonly clientX: number }) => {
        setActiveResize({
            columnKey,
            startClientX: pointerEvent.clientX,
            startWidth: latestWidthsRef.current[columnKey] ?? 0,
        });
    }, []);

    const resetWidths = useCallback(() => {
        applyWidths(defaultWidths);
        writeStoredWidths(storageKey, defaultWidths);
    }, [applyWidths, defaultWidths, storageKey]);

    useEffect(() => {
        if (activeResize === null) {
            return;
        }

        const handlePointerMove = (pointerMoveEvent: PointerEvent) => {
            const draggedWidth = activeResize.startWidth + (pointerMoveEvent.clientX - activeResize.startClientX);
            const clampedWidth = Math.min(maximalWidth, Math.max(minimalWidth, Math.round(draggedWidth)));

            applyWidths({ ...latestWidthsRef.current, [activeResize.columnKey]: clampedWidth });
        };

        const handlePointerUp = () => {
            setActiveResize(null);
            writeStoredWidths(storageKey, latestWidthsRef.current);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        // Note: While the edge is dragged, the whole page shows the resizing cursor and nothing gets selected
        const previousCursor = document.body.style.cursor;
        const previousUserSelect = document.body.style.userSelect;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            document.body.style.cursor = previousCursor;
            document.body.style.userSelect = previousUserSelect;
        };
    }, [activeResize, applyWidths, maximalWidth, minimalWidth, storageKey]);

    return { widths, isResizing: activeResize !== null, startResizing, resetWidths };
}
