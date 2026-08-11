import { assertResponseIsOk } from '@/lib/api/assertResponseIsOk';

/**
 * Ask one of our own api routes and read its answer
 *
 * @throws When the api reports a failure, with the message the api sent
 */
export async function requestJson<TAnswer>(url: string, options: RequestInit = {}): Promise<TAnswer> {
    const response = await fetch(url, options);

    await assertResponseIsOk(response);

    return (await response.json()) as TAnswer;
}

/**
 * Send a body to one of our own api routes and read its answer
 */
export async function sendJson<TAnswer>(url: string, method: string, body: unknown): Promise<TAnswer> {
    return requestJson<TAnswer>(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
