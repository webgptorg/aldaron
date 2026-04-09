import { proMestaSocialPreviewOptions } from '@/lib/social-preview-options';
import { createSocialPreviewImage, socialImageContentType, socialImageSize } from '@/lib/social-preview-image';

export const alt = proMestaSocialPreviewOptions.alt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function OpenGraphImage() {
    return createSocialPreviewImage(proMestaSocialPreviewOptions);
}
