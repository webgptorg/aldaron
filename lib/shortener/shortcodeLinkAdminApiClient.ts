import { ADMIN_SHORTENER_API_PATH } from '@/lib/shortener/shortcodeLinkConstants';
import type { ShortcodeLinkCreationValues } from '@/lib/shortener/shortcodeLinkSchema';

type ShortcodeLinkCreationResponse = {
    readonly shortcode?: unknown;
    readonly error?: unknown;
};

function getShortcodeLinkCreationErrorMessage(response: Response, payload: ShortcodeLinkCreationResponse): string {
    return typeof payload.error === 'string'
        ? payload.error
        : 'Short link creation failed with status ' + response.status;
}

/**
 * Creates a short link through the endpoint that verifies the session of the administration.
 */
export async function createAdminShortcodeLink(values: ShortcodeLinkCreationValues): Promise<string> {
    const response = await fetch(ADMIN_SHORTENER_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => ({}))) as ShortcodeLinkCreationResponse;

    if (!response.ok) {
        throw new Error(getShortcodeLinkCreationErrorMessage(response, payload));
    }
    if (typeof payload.shortcode !== 'string') {
        throw new Error('Short link creation returned no shortcode');
    }

    return payload.shortcode;
}
