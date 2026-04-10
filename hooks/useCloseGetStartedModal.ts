'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useCloseGetStartedModal() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('modal');
        params.delete('plan');

        const search = params.toString();
        const url = search ? `${pathname}?${search}` : pathname;

        router.push(url, { scroll: false });
    }, [pathname, router, searchParams]);
}
