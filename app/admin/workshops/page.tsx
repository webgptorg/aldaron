import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { ADMIN_WORKSHOPS_PATH } from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';
import { appendSearchParameters } from '@/lib/api/appendSearchParameters';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';

type AdminWorkshopsPageProps = {
    readonly searchParams: Promise<{
        readonly workshop?: string | string[];
    }>;
};

export default async function AdminWorkshopsPage({ searchParams }: AdminWorkshopsPageProps) {
    const workshopSlug = readFirstSearchParameter((await searchParams).workshop);

    // Note: The chosen workshop is named to the login as well, so signing in returns to the very workshop which was asked for
    await requireAdminSignedIn(appendSearchParameters(ADMIN_WORKSHOPS_PATH, { workshop: workshopSlug ?? undefined }));

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation title="Živé workshopy" />
            <WorkshopAdminDashboard initialWorkshopSlug={workshopSlug} />
        </main>
    );
}
