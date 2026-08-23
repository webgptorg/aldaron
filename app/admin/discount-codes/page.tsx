import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { DiscountCodeAdmin } from '@/components/admin/DiscountCodeAdmin';
import { ADMIN_DISCOUNT_CODES_PATH } from '@/lib/admin/adminConstants';
import { requireAdminSignedIn } from '@/lib/admin/requireAdminSignedIn';

export default async function AdminDiscountCodesPage() {
    await requireAdminSignedIn(ADMIN_DISCOUNT_CODES_PATH);

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation title="Slevové kódy" />
            <DiscountCodeAdmin />
        </main>
    );
}
