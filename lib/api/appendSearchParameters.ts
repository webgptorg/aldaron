/**
 * Add the given query parameters to a path which carries none yet, leaving out the ones which have no value
 */
export function appendSearchParameters(
    pathname: string,
    parameters: Readonly<Record<string, string | undefined>> = {},
): string {
    const searchParameters = new URLSearchParams();

    for (const [name, value] of Object.entries(parameters)) {
        if (value !== undefined) {
            searchParameters.set(name, value);
        }
    }

    const serializedParameters = searchParameters.toString();

    return serializedParameters === '' ? pathname : `${pathname}?${serializedParameters}`;
}
