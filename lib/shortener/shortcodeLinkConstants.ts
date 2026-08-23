export const ADMIN_SHORTENER_PATH = '/admin/shortener';
export const ADMIN_SHORTENER_API_PATH = '/api/admin/shortener';
export const SHORTCODE_LINK_TABLE_NAME = 'ShortcodeLink';
export const CUSTOM_SHORTCODE_LINK_TYPE = 'CUSTOM';

/**
 * The public address under which every shortcode of this database is read
 *
 * Note: A short link is only ever worth its length, so the address is said in exactly one place instead of being
 *       repeated by every form, preview, QR code and listing which shows one.
 */
export const SHORTCODE_LINK_PUBLIC_BASE_URL = 'https://ptbk.io/';
