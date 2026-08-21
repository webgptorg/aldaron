import { buildAdminUrl } from '@/lib/admin/buildAdminApiUrl';
import { readFirstSearchParameter } from '@/lib/api/readFirstSearchParameter';
import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import { redirect } from 'next/navigation';

type LegacyShortenerPageProps = {
    readonly searchParams: Promise<{ readonly token?: string | string[] }>;
};

/**
 * Keep bookmarks working while moving the creator behind the protected admin route.
 */
export default async function LegacyShortenerPage({ searchParams }: LegacyShortenerPageProps) {
    const adminToken = readFirstSearchParameter((await searchParams).token);

    redirect(adminToken === null ? ADMIN_SHORTENER_PATH : buildAdminUrl(ADMIN_SHORTENER_PATH, adminToken));
}
