'use client';

import dynamic from 'next/dynamic';

/**
 * The branded QR renderer used wherever a Promptbook URL needs to move from a desktop screen to a phone.
 *
 * It stays client-only because the underlying canvas is drawn in the browser. Keeping that boundary here lets the
 * shortener and participant rooms use exactly the same QR-code implementation.
 */
export const PromptbookQrCode = dynamic(() => import('@promptbook/components').then((module) => module.PromptbookQrCode), {
    ssr: false,
});
