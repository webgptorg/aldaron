'use client';

import LogRocket from 'logrocket';
import { useEffect } from 'react';

let hasInitializedLogRocket = false;

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (hasInitializedLogRocket) {
            return;
        }

        LogRocket.init('xuy44p/promptbook');
        hasInitializedLogRocket = true;
    }, []);

    return <>{children}</>;
}
