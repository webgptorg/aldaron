import { redirectToLegalPage } from '@/lib/legal/redirectToLegalPage';

export default async function TermsRedirectPage() {
    await redirectToLegalPage('termsAndConditions');
}
