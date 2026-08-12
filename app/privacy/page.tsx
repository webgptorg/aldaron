import { redirectToLegalPage } from '@/lib/legal/redirectToLegalPage';

export default async function PrivacyRedirectPage() {
    await redirectToLegalPage('privacyPolicy');
}
