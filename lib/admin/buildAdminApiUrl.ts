import { ADMIN_TOKEN_QUERY_PARAMETER } from '@/lib/admin/adminConstants';

/**
 * Build an admin path carrying the shared token and optional view parameters.
 */
export function buildAdminUrl(
    pathname: string,
    adminToken: string | null,
    additionalParameters: Readonly<Record<string, string | undefined>> = {},
): string {
    const searchParameters = new URLSearchParams({ [ADMIN_TOKEN_QUERY_PARAMETER]: adminToken ?? '' });

    for (const [name, value] of Object.entries(additionalParameters)) {
        if (value !== undefined) {
            searchParameters.set(name, value);
        }
    }

    return `${pathname}?${searchParameters}`;
}
