'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * How long the changes of a view are collected before the address bar is written, so that typing into a filter does
 * not rewrite the link letter by letter
 */
const URL_VIEW_STATE_DEBOUNCE_MILLISECONDS = 300;

type UseUrlSynchronizedViewStateOptions<TViewState> = {
    readonly parseViewState: (searchParams: URLSearchParams) => TViewState;
    readonly serializeViewState: (viewState: TViewState, searchParams: URLSearchParams) => URLSearchParams;
};

type UseUrlSynchronizedViewStateResult<TViewState> = readonly [
    TViewState,
    (changeViewState: (previousViewState: TViewState) => TViewState) => void,
];

/**
 * Build the address of the page which is open, with the given query parameters
 */
function buildUrlWithSearchParams(searchParams: URLSearchParams): string {
    const search = searchParams.toString();

    return `${window.location.pathname}${search === '' ? '' : `?${search}`}${window.location.hash}`;
}

/**
 * A view kept in the URL, so that the link to exactly the same view can be shared
 *
 * Note: The link is read when the page opens and written on every change, never the other way around, so that typing
 *       into a filter stays as smooth as with a plain state
 */
export function useUrlSynchronizedViewState<TViewState>({
    parseViewState,
    serializeViewState,
}: UseUrlSynchronizedViewStateOptions<TViewState>): UseUrlSynchronizedViewStateResult<TViewState> {
    const searchParams = useSearchParams();

    const [viewState, setViewState] = useState<TViewState>(() =>
        parseViewState(new URLSearchParams(searchParams.toString())),
    );

    useEffect(() => {
        const urlUpdateTimeout = setTimeout(() => {
            const currentSearchParams = new URLSearchParams(window.location.search);
            const newSearchParams = serializeViewState(viewState, currentSearchParams);

            if (newSearchParams.toString() === currentSearchParams.toString()) {
                return;
            }

            // Note: The entry in the history is replaced and not pushed, so that the back button leaves the dashboard
            //       instead of walking back through every single change of the view
            window.history.replaceState(null, '', buildUrlWithSearchParams(newSearchParams));
        }, URL_VIEW_STATE_DEBOUNCE_MILLISECONDS);

        return () => clearTimeout(urlUpdateTimeout);
    }, [serializeViewState, viewState]);

    const changeViewState = useCallback(
        (getNewViewState: (previousViewState: TViewState) => TViewState) => setViewState(getNewViewState),
        [],
    );

    return [viewState, changeViewState];
}
