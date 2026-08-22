import { ADMIN_SHORTENER_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import { redirect } from 'next/navigation';

/**
 * Keep bookmarks working while moving the creator behind the protected admin route.
 */
export default async function LegacyShortenerPage() {
    redirect(ADMIN_SHORTENER_PATH);
}
