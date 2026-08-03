import { FOR_INDUSTRY_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/for-industry/forIndustryMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    FOR_INDUSTRY_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
