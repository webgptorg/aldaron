import { ADMIN_TOKEN_PARAMETER_NAME } from '@/lib/admin/adminToken';

/**
 * Build the url of an administration api endpoint with the admin token and the optional additional parameters
 */
export function buildAdminApiUrl(
    apiPath: string,
    adminToken: string | null,
    additionalParams: Readonly<Record<string, string>> = {},
): string {
    const searchParams = new URLSearchParams({
        [ADMIN_TOKEN_PARAMETER_NAME]: adminToken || '',
        ...additionalParams,
    });

    return `${apiPath}?${searchParams.toString()}`;
}
