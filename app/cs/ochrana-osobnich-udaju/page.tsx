import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { LEGAL_PAGE_METADATA } from '@/lib/legal/legalPageMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = LEGAL_PAGE_METADATA.privacyPolicy.cs;

export default function CsPrivacyPolicyPage() {
    return <LegalDocumentPage kind="privacyPolicy" language="cs" />;
}
