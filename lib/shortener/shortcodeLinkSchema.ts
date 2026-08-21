import { isAbsoluteUrl } from '@/lib/shortener/isAbsoluteUrl';
import { z } from 'zod';

const SHORTCODE_PATTERN = /^[A-Za-z0-9-]+$/;

/**
 * The only values an administrator may persist when creating a public short link.
 */
export const SHORTCODE_LINK_CREATION_SCHEMA = z.object({
    shortcode: z
        .string()
        .trim()
        .min(1)
        .regex(SHORTCODE_PATTERN, 'Shortcode can contain only letters, numbers, and hyphens'),
    urls: z
        .array(z.string().trim().min(1).refine(isAbsoluteUrl, 'Every URL must be a valid absolute URL'))
        .min(1, 'At least one URL is required'),
});

export type ShortcodeLinkCreationValues = z.infer<typeof SHORTCODE_LINK_CREATION_SCHEMA>;
