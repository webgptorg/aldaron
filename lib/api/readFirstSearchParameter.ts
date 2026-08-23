export type SearchParameterValue = string | string[] | undefined;

/**
 * Next.js represents a repeated query parameter as a list. Routes in this
 * project consistently use the first value and ignore the rest.
 */
export function readFirstSearchParameter(value: SearchParameterValue): string | null {
    return (Array.isArray(value) ? value[0] : value) ?? null;
}

/**
 * The whole query of a request as plain values, so that a page can carry every parameter it was asked with onwards
 */
export function readFirstSearchParameters(
    searchParams: Readonly<Record<string, SearchParameterValue>>,
): Readonly<Record<string, string | undefined>> {
    return Object.fromEntries(
        Object.entries(searchParams).map(([parameterName, value]) => [
            parameterName,
            readFirstSearchParameter(value) ?? undefined,
        ]),
    );
}
