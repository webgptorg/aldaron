import { getPreferredHomepageLanguage } from '@/lib/homepage-language';
import { getLegalPagePath, type LegalDocumentKind } from '@/lib/legal/legalPagePaths';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Sends the visitor to the legal document written in the language their browser asks for
 *
 * Note: It serves the paths which held the documents before they were published in both languages, so a link which is
 *       already out in the world keeps leading to the right page.
 *
 * @param kind legal document the visitor asked for
 */
export async function redirectToLegalPage(kind: LegalDocumentKind): Promise<never> {
    const requestHeaders = await headers();
    const language = getPreferredHomepageLanguage(requestHeaders.get('accept-language'));

    redirect(getLegalPagePath(kind, language));
}
