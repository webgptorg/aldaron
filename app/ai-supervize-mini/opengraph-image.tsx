import { AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/ai-supervize-mini/aiSupervizeMiniMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    AI_SUPERVIZE_MINI_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
