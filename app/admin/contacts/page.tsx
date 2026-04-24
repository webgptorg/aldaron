'use client';

import { Suspense } from 'react';
import AdminContactsComponent from './AdminContactsComponent';

export default function AdminContactsPage() {
    return (
        <Suspense>
            <AdminContactsComponent />
        </Suspense>
    );
}
