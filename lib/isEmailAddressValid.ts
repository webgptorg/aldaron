/**
 * How an e-mail address is expected to look
 *
 * Note: The check is deliberately loose. The only real proof that an address exists is the message which arrives at
 *       it, so a stricter pattern would only turn away people with unusual, yet perfectly valid addresses.
 */
const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Whether the text can be an e-mail address at all
 */
export function isEmailAddressValid(email: string): boolean {
    return EMAIL_ADDRESS_PATTERN.test(email);
}
