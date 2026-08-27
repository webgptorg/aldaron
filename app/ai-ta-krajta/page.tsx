import { AiTaKrajtaPage } from '@/businesses/ai-ta-krajta/_AiTaKrajtaPage';
import { AI_TA_KRAJTA_METADATA, createAiTaKrajtaStructuredData } from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { StructuredData } from '@/components/structured-data';

export const metadata = AI_TA_KRAJTA_METADATA;

export default function AiTaKrajtaRoute() {
    return (
        <>
            <StructuredData nodes={createAiTaKrajtaStructuredData()} />
            <AiTaKrajtaPage />
        </>
    );
}
