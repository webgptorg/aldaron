import { buildAdminLoginPath } from '@/lib/admin/adminLoginRedirect';
import { isAdminSignedIn } from '@/lib/admin/isAdminSignedIn';
import { redirect } from 'next/navigation';

/**
 * Let one page of the administration render only for a signed in administrator, and send anybody else to the login
 *
 * Note: The page names itself, so that the sign in returns to the very page which was asked for
 */
export async function requireAdminSignedIn(currentAdminPath: string): Promise<void> {
    if (!(await isAdminSignedIn())) {
        redirect(buildAdminLoginPath(currentAdminPath));
    }
}
