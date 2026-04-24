'use client';

import { useState } from 'react';
import { useGetParam } from './useGetParam';

/**
 * Behaves like `useState`, but the state is either synced with a URL query parameter or behaves like a normal state with a default value.
 *
 * - If the URL query parameter is present, it takes precedence over the default value.
 * - If the URL query parameter is absent, the state behaves like a normal state initialized with the default value.
 */
export function useOptionalGetParam<T extends string>(
    paramName: string,
    getDefaultValue?: () => T,
): readonly [state: T | null, setState: (newState: T | null) => void] {
    const [stateFromUrl, setStateInUrl] = useGetParam<T>(paramName);
    const [state, setState] = useState<T | null>(stateFromUrl || getDefaultValue || null);

    if (stateFromUrl !== null) {
        return [stateFromUrl, setStateInUrl];
    } else {
        return [state, setState];
    }
}
