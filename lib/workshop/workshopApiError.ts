/**
 * Error which already knows which status code the api answer should carry
 */
export type WorkshopApiError = Error & { readonly statusCode: number };

/**
 * Build a failure of the workshop api together with the status code it should be answered with
 */
export function createWorkshopApiError(message: string, statusCode: number): WorkshopApiError {
    return Object.assign(new Error(message), { statusCode });
}

/**
 * Status code an error asks to be answered with, `500` for anything unexpected
 */
export function getErrorStatusCode(error: unknown): number {
    const statusCode = (error as Partial<WorkshopApiError> | null)?.statusCode;

    return typeof statusCode === 'number' ? statusCode : 500;
}
