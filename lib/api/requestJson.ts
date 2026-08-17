type JsonErrorBody = {
    readonly error?: unknown;
};

/**
 * Send JSON and parse the JSON response with one consistent error contract.
 */
export async function sendJson<ResponseBody>(
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body: unknown,
): Promise<ResponseBody> {
    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const responseBody = (await response.json().catch(() => ({}))) as JsonErrorBody & ResponseBody;
    if (!response.ok) {
        throw new Error(
            typeof responseBody.error === 'string'
                ? responseBody.error
                : `Request failed with status ${response.status}`,
        );
    }
    return responseBody;
}
