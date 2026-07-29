import { HOMEPAGE_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/homepage/homepageMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    HOMEPAGE_SOCIAL_PREVIEW_OPTIONS.cs,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
