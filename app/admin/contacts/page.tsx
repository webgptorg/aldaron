import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { getValidAdminTokenOrNull } from '@/lib/admin/getValidAdminTokenOrNull';
import { Suspense } from 'react';
import AdminContactsComponent from './AdminContactsComponent';

type AdminContactsPageProps = {
    readonly searchParams: Promise<{ readonly token?: string | string[] }>;
};

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
    const adminToken = getValidAdminTokenOrNull((await searchParams).token);
    if (adminToken === null) {
        return <AdminAccessRequired actionPath="/admin/contacts" />;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation adminToken={adminToken} title="Kontakty a leady" />
            <Suspense>
                <AdminContactsComponent adminToken={adminToken} />
            </Suspense>
        </main>
    );
}
