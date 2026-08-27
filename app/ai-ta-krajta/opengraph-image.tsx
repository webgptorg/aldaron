import { AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/ai-ta-krajta/aiTaKrajtaMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    AI_TA_KRAJTA_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
