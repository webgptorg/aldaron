import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin/adminConstants';
import { isAdminSessionValueValid } from '@/lib/admin/adminSession';
import { cookies } from 'next/headers';

/**
 * Whether the browser which asks for a page carries a valid session of the administration
 */
export async function isAdminSignedIn(): Promise<boolean> {
    const cookieStore = await cookies();

    return isAdminSessionValueValid(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}
