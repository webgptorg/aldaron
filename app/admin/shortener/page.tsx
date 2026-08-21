import { AdminAccessRequired } from '@/components/admin/AdminAccessRequired';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { UrlShortener } from '@/components/url-shortener';
import { getValidAdminTokenOrNull } from '@/lib/admin/getValidAdminTokenOrNull';
import { ADMIN_SHORTENER_METADATA } from '@/lib/metadata/site-page-definitions';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';

type AdminShortenerPageProps = {
    readonly searchParams: Promise<{ readonly token?: string | string[] }>;
};

export const metadata = ADMIN_SHORTENER_METADATA;

export default async function AdminShortenerPage({ searchParams }: AdminShortenerPageProps) {
    const adminToken = getValidAdminTokenOrNull((await searchParams).token);
    if (adminToken === null) {
        return <AdminAccessRequired actionPath={ADMIN_SHORTENER_PATH} />;
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <AdminNavigation adminToken={adminToken} title="Zkracovač odkazů" />
            <UrlShortener adminToken={adminToken} />
        </main>
    );
}
