import { PAVOL_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pavol/pavolMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    PAVOL_SOCIAL_PREVIEW_OPTIONS.en,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
