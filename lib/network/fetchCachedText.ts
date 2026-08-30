export type FetchCachedTextOptions = {
    /**
     * Address the text is read from
     */
    readonly url: string;

    /**
     * How long an answer may be reused before the address is read again
     */
    readonly revalidateSeconds: number;

    /**
     * Which kinds of document the publisher may answer with, as an `Accept` header
     */
    readonly acceptedMediaTypes: string;
};

/**
 * Reads a document of another publisher, keeping the answer on the server for a while
 *
 * Note: The server asks a publisher at most once per revalidation window however many visitors open the page, which is
 *       both what keeps the page fast and what keeps this application a polite client of somebody else's feed.
 *
 *       A page built on somebody else's document is a landing page first. When the publisher is unreachable or answers
 *       with an error, the failure ends here and the caller receives nothing instead of an exception.
 *
 * @returns body of the answer, `null` when it could not be read
 */
export async function fetchCachedText(options: FetchCachedTextOptions): Promise<string | null> {
    try {
        const response = await fetch(options.url, {
            headers: { Accept: options.acceptedMediaTypes },
            next: { revalidate: options.revalidateSeconds },
        });

        if (!response.ok) {
            console.error(`${options.url} answered with the status ${response.status}`);
            return null;
        }

        return await response.text();
    } catch (fetchError) {
        console.error(`${options.url} could not be read`, fetchError);
        return null;
    }
}
