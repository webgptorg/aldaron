import { AiTaKrajtaMediaKitPage } from '@/businesses/ai-ta-krajta/AiTaKrajtaMediaKitPage';
import {
    AI_TA_KRAJTA_MEDIA_KIT_METADATA,
    AI_TA_KRAJTA_VIEWPORT,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';

export const metadata = AI_TA_KRAJTA_MEDIA_KIT_METADATA;
export const viewport = AI_TA_KRAJTA_VIEWPORT;

export default function AiTaKrajtaMediaKitRoute() {
    return <AiTaKrajtaMediaKitPage />;
}
