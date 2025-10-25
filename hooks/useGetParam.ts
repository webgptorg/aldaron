'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Behaves like `useState`, but the state is synced with a URL query parameter.
 */
export function useGetParam<T extends string>(
    paramName: string,
): readonly [state: T | null, setState: (newState: T | null) => void] {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const state = useMemo<T | null>(() => {
        const val = searchParams.get(paramName);
        return val === null ? null : (val as T);
    }, [paramName, searchParams]);

    const setState = useCallback(
        (newState: T | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (newState === null) {
                params.delete(paramName);
            } else {
                params.set(paramName, newState);
            }

            const search = params.toString();
            const url = search ? `${pathname}?${search}` : pathname;

            router.push(url);
        },
        [router, paramName, searchParams, pathname],
    );

    return [state, setState];
}
