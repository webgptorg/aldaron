/**
 * Turn a failed response of one of our own api routes into an error carrying the message the api sent
 *
 * Note: Every api route of this site answers a failure as `{ error: string }`, so one reader of that shape is enough.
 */
export async function assertResponseIsOk(response: Response): Promise<void> {
    if (response.ok) {
        return;
    }

    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error || `The api responded with the status ${response.status}`);
}
