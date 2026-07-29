import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { PAVOL_METADATA, createPavolStructuredData } from '@/businesses/pavol/pavolMetadata';
import { StructuredData } from '@/components/structured-data';

export const metadata = PAVOL_METADATA.en;

export default function EnPavolPage() {
    return (
        <>
            <StructuredData nodes={[createPavolStructuredData('en')]} />
            <PavolPage language="en" />
        </>
    );
}
