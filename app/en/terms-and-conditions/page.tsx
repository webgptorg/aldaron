import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import { LEGAL_PAGE_METADATA } from '@/lib/legal/legalPageMetadata';
import type { Metadata } from 'next';

export const metadata: Metadata = LEGAL_PAGE_METADATA.termsAndConditions.en;

export default function EnTermsAndConditionsPage() {
    return <LegalDocumentPage kind="termsAndConditions" language="en" />;
}
