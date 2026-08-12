import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { LEGAL_PAGE_METADATA } from '@/lib/legal/legalPageMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = LEGAL_PAGE_METADATA.privacyPolicy.en;

export default function EnPrivacyPolicyPage() {
    return <LegalDocumentPage kind="privacyPolicy" language="en" />;
}
