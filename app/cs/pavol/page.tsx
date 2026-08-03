import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { PAVOL_METADATA, createPavolStructuredData } from '@/businesses/pavol/pavolMetadata';
import { StructuredData } from '@/components/structured-data';

export const metadata = PAVOL_METADATA.cs;

export default function CsPavolPage() {
    return (
        <>
            <StructuredData nodes={[createPavolStructuredData('cs')]} />
            <PavolPage language="cs" />
        </>
    );
}
