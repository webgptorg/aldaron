import { isAdminTokenValid } from '@/lib/admin/adminApiGuard';
import { readFirstSearchParameter, type SearchParameterValue } from '@/lib/api/readFirstSearchParameter';

/**
 * Reads the shared admin token from a page query parameter and returns it only when it opens the administration.
 */
export function getValidAdminTokenOrNull(token: SearchParameterValue): string | null {
    const adminToken = readFirstSearchParameter(token);

    return isAdminTokenValid(adminToken) ? adminToken : null;
}
