import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Site-relative path of the podcast page
 */
export const AI_TA_KRAJTA_PATH = '/ai-ta-krajta';

/**
 * Name of the podcast
 */
export const AI_TA_KRAJTA_NAME = 'AI ta Krajta';

/**
 * YouTube channel every episode is published on
 */
export const AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@aitakrajta_tv';

/**
 * Cover artwork of the podcast
 */
export const AI_TA_KRAJTA_COVER_IMAGE_PATH = '/pavol/media/ai-ta-krajta.jpg';

/**
 * Dark green the cover artwork sits on, which the whole page is built around
 */
export const AI_TA_KRAJTA_BACKGROUND_COLOR = '#303832';

/**
 * Warm end of the gradient the snake of the cover artwork is painted with
 */
export const AI_TA_KRAJTA_ACCENT_COLOR = '#ff6b6b';

/**
 * Cool end of the very same gradient
 */
export const AI_TA_KRAJTA_ACCENT_SOFT_COLOR = '#6b8cff';

/**
 * Kind of show, as it is presented wherever the podcast is listed
 */
export const AI_TA_KRAJTA_KIND = 'Video podcast';

/**
 * One sentence saying what the podcast is, in every language the site is published in
 *
 * Note: The very same sentence introduces the podcast on its own page, among the media appearances of Pavol Hejný and
 *       in the sharing preview, so it is written down exactly once.
 */
export const AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'Vše o AI na jednom místě, každý týden. Novinky, poutavé zajímavosti a diskuze z oblasti umělé inteligence.',
    en: 'Everything about AI in one place, every week. News, engaging points of interest, and discussions from the field of artificial intelligence.',
};

/**
 * Name under which an e-mail left on the podcast page is stored among the contacts
 */
export const AI_TA_KRAJTA_SUBSCRIPTION_PLACE_NAME = 'AiTaKrajtaSubscription';

/**
 * Address where a listener can offer a topic or ask to come as a guest
 */
export const AI_TA_KRAJTA_CONTACT_EMAIL = 'pavol@ptbk.io';

/**
 * One episode highlighted on the page
 */
export type AiTaKrajtaEpisode = {
    /**
     * Id of the episode on YouTube, or the whole address of it - both are understood
     */
    readonly youtubeVideo: string;

    /**
     * Title of the episode
     */
    readonly title: string;

    /**
     * One or two sentences about what the episode is about
     */
    readonly description: string;
};

/**
 * Episodes highlighted above the way to the whole channel
 *
 * Note: Nothing is highlighted until somebody picks the episodes which are worth it - the page then leads straight to
 *       the channel, which is where every episode lives anyway.
 */
export const AI_TA_KRAJTA_FEATURED_EPISODES: readonly AiTaKrajtaEpisode[] = [];
