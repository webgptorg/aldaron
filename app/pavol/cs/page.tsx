import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { pavolPageContent } from '@/businesses/pavol/pavolContent';

export const metadata = pavolPageContent.cs.metadata;

export default function PavolCsPage() {
    return <PavolPage language="cs" />;
}
