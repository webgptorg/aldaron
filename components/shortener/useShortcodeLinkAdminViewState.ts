'use client';

import { useUrlSynchronizedViewState } from '@/hooks/useUrlSynchronizedViewState';
import {
    parseShortcodeLinkAdminViewState,
    serializeShortcodeLinkAdminViewState,
    type ShortcodeLinkAdminViewState,
} from '@/lib/shortener/shortcodeLinkAdminViewState';
import { useCallback } from 'react';

type UseShortcodeLinkAdminViewStateResult = ShortcodeLinkAdminViewState & {
    readonly changeShortcodeLinkAdminViewState: (changes: Partial<ShortcodeLinkAdminViewState>) => void;
};

/**
 * Keeps the short-link filters, sorting, and opened click history in the address so one administrator can share the
 * exact view with another.
 */
export function useShortcodeLinkAdminViewState(): UseShortcodeLinkAdminViewStateResult {
    const [viewState, setViewState] = useUrlSynchronizedViewState<ShortcodeLinkAdminViewState>({
        parseViewState: parseShortcodeLinkAdminViewState,
        serializeViewState: serializeShortcodeLinkAdminViewState,
    });

    const changeShortcodeLinkAdminViewState = useCallback(
        (changes: Partial<ShortcodeLinkAdminViewState>) =>
            setViewState((previousViewState) => ({ ...previousViewState, ...changes })),
        [setViewState],
    );

    return { ...viewState, changeShortcodeLinkAdminViewState };
}
