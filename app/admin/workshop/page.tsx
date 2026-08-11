'use client';

import { Suspense } from 'react';
import AdminWorkshopComponent from './AdminWorkshopComponent';

export default function AdminWorkshopPage() {
    return (
        <Suspense>
            <AdminWorkshopComponent />
        </Suspense>
    );
}
