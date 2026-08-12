/**
 * Is the parsed JSON body an object which can carry named fields?
 */
function isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Read the JSON body of a request as an object, or `null` when the request does not carry one
 *
 * Note: A body which is not valid JSON, or is a list or a bare value instead of an object, is refused here, so that it
 *       never reaches a database query.
 */
export async function readJsonObjectOrNull(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body: unknown = await request.json();

        return isJsonObject(body) ? body : null;
    } catch {
        return null;
    }
}
