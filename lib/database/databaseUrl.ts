export const DATABASE_URL_ENVIRONMENT_VARIABLE = 'DATABASE_URL';

/**
 * Resolve the server-side database URL once, keeping explicit values useful for callers and tests.
 */
export function resolveDatabaseUrl(databaseUrl?: string | null): string | undefined {
    const configuredDatabaseUrl = databaseUrl ?? process.env[DATABASE_URL_ENVIRONMENT_VARIABLE];
    const trimmedDatabaseUrl = configuredDatabaseUrl?.trim();

    return trimmedDatabaseUrl === undefined || trimmedDatabaseUrl === '' ? undefined : trimmedDatabaseUrl;
}

export function requireDatabaseUrl(databaseUrl: string | null | undefined, operation: string): string {
    const resolvedDatabaseUrl = resolveDatabaseUrl(databaseUrl);

    if (resolvedDatabaseUrl === undefined) {
        throw new Error(`Cannot ${operation}: ${DATABASE_URL_ENVIRONMENT_VARIABLE} is not configured.`);
    }

    return resolvedDatabaseUrl;
}
