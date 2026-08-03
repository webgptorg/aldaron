import { DEFAULT_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/_generic/defaultMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } =
    createSocialPreviewImageRoute(DEFAULT_SOCIAL_PREVIEW_OPTIONS);

export { alt, contentType, size };
export default renderSocialPreviewImage;
