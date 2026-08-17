import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { isAdminTokenValid } from '@/lib/admin/adminApiGuard';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';
import { Suspense } from 'react';
import AdminContactsComponent from './AdminContactsComponent';

type AdminContactsPageProps = {
    readonly searchParams: Promise<{ readonly token?: string | string[] }>;
};

export default async function AdminContactsPage({ searchParams }: AdminContactsPageProps) {
    const adminToken = readFirstSearchParameter((await searchParams).token);
    if (adminToken === null || !isAdminTokenValid(adminToken)) {
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
