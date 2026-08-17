export type SearchParameterValue = string | string[] | undefined;

/**
 * Next.js represents a repeated query parameter as a list. Routes in this
 * project consistently use the first value and ignore the rest.
 */
export function readFirstSearchParameter(value: SearchParameterValue): string | null {
    return (Array.isArray(value) ? value[0] : value) ?? null;
}
