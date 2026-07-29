import { HACKATHON_FACTORY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/hackathon-factory/hackathonFactoryMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    HACKATHON_FACTORY_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
