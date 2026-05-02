import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { pavolPageContent } from '@/businesses/pavol/pavolContent';

export const metadata = pavolPageContent.en.metadata;

export default function PavolEnPage() {
    return <PavolPage language="en" />;
}
