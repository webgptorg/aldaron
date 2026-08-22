import { COMMUNITY_ADMIN_PATH, COMMUNITY_WORKSHOP_SLUG } from '@/businesses/community/config';
import { WorkshopAdminDashboard } from '@/businesses/workshop-admin/WorkshopAdminDashboard';
import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { getValidAdminTokenOrNull } from '@/lib/admin/getValidAdminTokenOrNull';

type AdminCommunityPageProps = {
    readonly searchParams: Promise<{
        readonly token?: string | string[];
    }>;
};

/**
 * Administration of the one persistent community. The reusable dashboard is restricted to the `community` room kind,
 * so workshop occurrences cannot be edited accidentally from this route, and the kind itself takes away what a single
 * permanent room does not have: a choice between rooms, the creation of a second one, and an editable URL.
 */
export default async function AdminCommunityPage({ searchParams }: AdminCommunityPageProps) {
    const adminToken = getValidAdminTokenOrNull((await searchParams).token);
    if (adminToken === null) {
        return <AdminAccessRequired actionPath={COMMUNITY_ADMIN_PATH} />;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation adminToken={adminToken} title="Komunita Promptbooku" />
            <WorkshopAdminDashboard
                adminToken={adminToken}
                initialWorkshopSlug={COMMUNITY_WORKSHOP_SLUG}
                workshopKind="community"
                subjectLabel="komunity"
                emptyStateMessage="Komunita zatím není vytvořená. Spusťte databázovou migraci pro komunitu."
            />
        </main>
    );
}
