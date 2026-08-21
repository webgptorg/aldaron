import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { getValidAdminTokenOrNull } from '@/lib/admin/getValidAdminTokenOrNull';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';

type AdminWorkshopsPageProps = {
    readonly searchParams: Promise<{
        readonly token?: string | string[];
        readonly workshop?: string | string[];
    }>;
};

export default async function AdminWorkshopsPage({ searchParams }: AdminWorkshopsPageProps) {
    const resolvedSearchParams = await searchParams;
    const adminToken = getValidAdminTokenOrNull(resolvedSearchParams.token);
    if (adminToken === null) {
        return <AdminAccessRequired actionPath="/admin/workshops" />;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation adminToken={adminToken} title="Živé workshopy" />
            <WorkshopAdminDashboard
                adminToken={adminToken}
                initialWorkshopSlug={readFirstSearchParameter(resolvedSearchParams.workshop)}
            />
        </main>
    );
}
