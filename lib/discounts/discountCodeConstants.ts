/**
 * The private table of discount codes, which only the service role of the server ever reaches.
 */
export const DISCOUNT_CODE_TABLE_NAME = 'discount_codes';

/**
 * The database function which takes one use of a code and reads what is left of it in one statement.
 */
export const CONSUME_DISCOUNT_CODE_FUNCTION_NAME = 'consume_discount_code';

/**
 * The query parameter through which a link hands a discount code to any registration page.
 */
export const DISCOUNT_CODE_QUERY_PARAMETER = 'code';

/**
 * Every registration page uses the same anchor so generated discount links can scroll to it.
 */
export const REGISTRATION_SECTION_ID = 'registrace';

/**
 * Public validation endpoint used by every discount-code field.
 */
export const DISCOUNT_CODE_VALIDATION_API_PATH = '/api/discount-codes/validate';

/**
 * Administration endpoint used by the shared discount-code dashboard.
 */
export const ADMIN_DISCOUNT_CODES_API_PATH = '/api/admin/discount-codes';

export const MAXIMAL_DISCOUNT_CODE_LENGTH = 100;
export const MAXIMAL_DISCOUNT_CODE_INPUT_LENGTH = 200;
export const MAXIMAL_DISCOUNT_PERCENT = 100;
export const MAXIMAL_DISCOUNT_CODE_USE_COUNT = 1_000_000;

/**
 * Stripe applies a repeating coupon for this many monthly renewals at most. A longer promotion
 * belongs to the permanent choice, which also remains the default for existing discount codes.
 */
export const MAXIMAL_SUBSCRIPTION_DISCOUNT_DURATION_MONTH_COUNT = 36;
