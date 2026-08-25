import { ONLINE_WORKSHOP_PARTICIPANT_SOCIAL_PREVIEW_OPTIONS } from '@/businesses/online-workshop/onlineWorkshopMetadata';
import { createSocialPreviewImageRoute } from '@/lib/metadata/social-preview-image-route';

const { alt, contentType, renderSocialPreviewImage, size } = createSocialPreviewImageRoute(
    ONLINE_WORKSHOP_PARTICIPANT_SOCIAL_PREVIEW_OPTIONS,
);

export { alt, contentType, size };
export default renderSocialPreviewImage;
