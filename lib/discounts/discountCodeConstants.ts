/**
 * The private table of discount codes, which only the service role of the server ever reaches
 */
export const DISCOUNT_CODE_TABLE_NAME = 'discount_codes';

/**
 * The database function which takes one use of a code and reads what is left of it in one statement
 */
export const CONSUME_DISCOUNT_CODE_FUNCTION_NAME = 'consume_discount_code';

/**
 * The one query parameter through which a link hands a discount code to any place of the
 * application, for example `/ai-supervize-mini?code=WEBINAR_2026_08_20`
 */
export const DISCOUNT_CODE_QUERY_PARAMETER = 'code';

/**
 * Every page which takes a registration names the section of its form this way, so that a link
 * carrying a discount code can scroll straight to the form it has just prefilled
 */
export const REGISTRATION_SECTION_ID = 'registrace';

/**
 * The public endpoint which answers about exactly one submitted code, never about the list of them
 */
export const DISCOUNT_CODE_VALIDATION_API_PATH = '/api/discount-codes/validate';

/**
 * The endpoints of the administration, which read the signed session cookie
 */
export const ADMIN_DISCOUNT_CODES_API_PATH = '/api/admin/discount-codes';

/**
 * How long a code may be, once normalized and as it is typed into a form before normalization
 */
export const MAXIMAL_DISCOUNT_CODE_LENGTH = 100;
export const MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH = 200;

/**
 * A discount is a whole percentage of the price and a limited code is used a whole number of times
 */
export const MAXIMAL_DISCOUNT_PERCENT = 100;
export const MAXIMAL_DISCOUNT_CODE_USE_COUNT = 1_000_000;
