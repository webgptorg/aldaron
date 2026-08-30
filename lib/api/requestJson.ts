type JsonErrorBody = {
    readonly error?: unknown;
};

/**
 * A refused request, carrying both what the endpoint said about it and the status it answered with
 *
 * Note: Every caller still reads `message`, exactly as before there was a class for this. The status is what lets a
 *       caller tell a refusal it can act on, such as an expired session, from one it can only report.
 */
export class JsonRequestError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = 'JsonRequestError';
    }
}

/**
 * Ask an endpoint and parse its JSON answer with one consistent error contract.
 *
 * Note: A refused request is turned into an `Error` carrying what the endpoint said about it, so that every caller can
 *       show the cause of a refusal instead of a bare status.
 *
 * Note: Nothing is read from a cache, because every caller of this asks about state which it is about to change or has
 *       just changed.
 */
export async function requestJson<ResponseBody>(
    url: string,
    requestOptions?: RequestInit,
    failureMessage: string = 'Request failed',
): Promise<ResponseBody> {
    const response = await fetch(url, { cache: 'no-store', ...requestOptions });
    const responseBody = (await response.json().catch(() => ({}))) as JsonErrorBody & ResponseBody;

    if (!response.ok) {
        throw new JsonRequestError(
            typeof responseBody.error === 'string'
                ? responseBody.error
                : `${failureMessage} with status ${response.status}`,
            response.status,
        );
    }

    return responseBody;
}

/**
 * Send JSON and parse the JSON response with one consistent error contract.
 */
export async function sendJson<ResponseBody>(
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body: unknown,
): Promise<ResponseBody> {
    return requestJson<ResponseBody>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
