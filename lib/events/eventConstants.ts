/**
 * The longest place an event can be held at, which is what the database stores for one term
 */
export const MAXIMAL_EVENT_LOCATION_LABEL_LENGTH = 200;

/**
 * The highest price one seat of an event can be written with, so a mistyped amount is refused instead of charged
 */
export const MAXIMAL_EVENT_PRICE_CZK = 1_000_000;

/**
 * The highest number of people one term can be limited to
 */
export const MAXIMAL_EVENT_PARTICIPANT_COUNT = 10_000;
