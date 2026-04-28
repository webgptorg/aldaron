import { getPreferredHomepageLanguage } from '@/lib/homepage-language';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootPage() {
    const requestHeaders = await headers();
    const language = getPreferredHomepageLanguage(requestHeaders.get('accept-language'));

    redirect(`/${language}`);
}
