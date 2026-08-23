/**
 * How a PostgREST answer describes a query which the database refused.
 *
 * Note: Every caller keeps nothing but `message` for the answer of an endpoint, while `code`, `details` and `hint` are
 *       what actually name the cause of the refusal. They are reported to the server console instead of being lost.
 */
export type SupabaseErrorLike = {
    readonly message: string;
    readonly code?: string | null;
    readonly details?: string | null;
    readonly hint?: string | null;
};

/**
 * The one place which says where the schema of this database is written down.
 */
const MIGRATION_FILE_PATTERN = 'migrations/*.sql';

/**
 * What an error code means when the database does not know the schema this code was written against.
 *
 * Note: Neither a retry nor a different request mends any of these, because the request is not what is wrong - the
 *       migrations have to be applied. Saying so is what turns a bare `500` of an administration page into something
 *       a developer can act on.
 */
const OUTDATED_DATABASE_SCHEMA_CAUSE_BY_ERROR_CODE: Readonly<Record<string, string | undefined>> = {
    '42702': 'a name inside a database function means both a column and a `RETURNS TABLE` variable of the same name',
    '42703': 'a column which this code reads does not exist',
    '42883': 'a database function which this code calls does not exist',
    PGRST202: 'the database offers no function of this name and these arguments',
    PGRST204: 'the database offers no column of this name',
};

/**
 * Whether this server runs for a developer who is watching the `npm run dev` console.
 */
function isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development';
}

function formatQueryParameters(parameters: Readonly<Record<string, unknown>>): string {
    try {
        return JSON.stringify(parameters);
    } catch {
        return String(parameters);
    }
}

function createSupabaseErrorReport(
    operationName: string,
    error: SupabaseErrorLike,
    parameters: Readonly<Record<string, unknown>> | undefined,
): string {
    const reportLines = [`⚠️ The database refused ${operationName}: ${error.message}`];

    if (error.code) {
        reportLines.push(`   Error code: ${error.code}`);
    }

    if (error.details) {
        reportLines.push(`   Details: ${error.details}`);
    }

    if (error.hint) {
        reportLines.push(`   Hint: ${error.hint}`);
    }

    const outdatedDatabaseSchemaCause = OUTDATED_DATABASE_SCHEMA_CAUSE_BY_ERROR_CODE[error.code ?? ''];
    if (outdatedDatabaseSchemaCause !== undefined) {
        reportLines.push(
            `   💡 The database is behind this code, because ${outdatedDatabaseSchemaCause}. Apply \`${MIGRATION_FILE_PATTERN}\` to it.`,
        );
    }

    // Note: The arguments of a query carry what a person searched for, which belongs into the console of the developer
    //       who caused the query and not into the long-lived log of a production server.
    if (parameters !== undefined && isDevelopmentMode()) {
        reportLines.push(`   Parameters: ${formatQueryParameters(parameters)}`);
    }

    return reportLines.join('\n');
}

/**
 * Say in the server console which query the database refused and why, and answer with the message of the refusal.
 *
 * Note: The returned message is the very same one which the caller already answered a request with, so that reporting
 *       a refusal and answering it can never drift apart.
 */
export function reportSupabaseError(
    operationName: string,
    error: SupabaseErrorLike,
    parameters?: Readonly<Record<string, unknown>>,
): string {
    console.error(createSupabaseErrorReport(operationName, error, parameters));

    return error.message;
}
