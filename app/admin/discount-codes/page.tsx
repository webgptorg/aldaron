import { AiSupervizeMiniDiscountCodeAdmin } from '@/businesses/ai-supervize-mini/AiSupervizeMiniDiscountCodeAdmin';
import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { getValidAdminTokenOrNull } from '@/lib/admin/getValidAdminTokenOrNull';

type AdminDiscountCodesPageProps = {
    readonly searchParams: Promise<{ readonly token?: string | string[] }>;
};

export default async function AdminDiscountCodesPage({ searchParams }: AdminDiscountCodesPageProps) {
    const adminToken = getValidAdminTokenOrNull((await searchParams).token);
    if (adminToken === null) {
        return <AdminAccessRequired actionPath="/admin/discount-codes" />;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation adminToken={adminToken} title="Slevové kódy" />
            <AiSupervizeMiniDiscountCodeAdmin adminToken={adminToken} />
        </main>
    );
}
