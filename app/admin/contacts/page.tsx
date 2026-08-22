import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { ADMIN_CONTACTS_PATH } from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { Suspense } from 'react';
import AdminContactsComponent from './AdminContactsComponent';

export default async function AdminContactsPage() {
    await requireAdminSignedIn(ADMIN_CONTACTS_PATH);

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation title="Kontakty a leady" />
            <Suspense>
                <AdminContactsComponent />
            </Suspense>
        </main>
    );
}
