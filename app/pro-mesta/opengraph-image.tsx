import { CITIES_CS_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/pro-mesta/citiesCsMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    CITIES_CS_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
