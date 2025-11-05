'use client';

import { useEffect, useState } from 'react';

export function useIsLocalhost() {
    const [isLocalhost, setIsLocalhost] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            setIsLocalhost(true);
        }
    }, []);

    return isLocalhost;
}
