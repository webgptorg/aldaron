'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

type WorkshopAdminRefreshButtonProps = {
    readonly className?: string;
    readonly onRefresh: () => void;
};

/**
 * Loads the administration again on demand, wherever the current layout has room for it
 */
export function WorkshopAdminRefreshButton({ className, onRefresh }: WorkshopAdminRefreshButtonProps) {
    return (
        <Button type="button" variant="ghost" size="sm" className={className} onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Obnovit data
        </Button>
    );
}
