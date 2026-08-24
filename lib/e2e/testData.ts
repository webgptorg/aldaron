/**
 * The domain reserved for E2E submissions. It keeps real people out of the
 * configured database and gives the garbage collector one precise boundary.
 */
export const E2E_TEST_EMAIL_DOMAIN = 'example.com';

export const E2E_TEST_EMAIL_SQL_PATTERN = `%@${E2E_TEST_EMAIL_DOMAIN}`;

let emailSequence = 0;

/**
 * Create a unique e-mail address which the public forms accept and the
 * cleanup command can safely recognise.
 */
export function createE2eTestEmail(label: string): string {
    emailSequence += 1;

    const safeLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'submission';

    return `e2e-${safeLabel}-${Date.now()}-${emailSequence}@${E2E_TEST_EMAIL_DOMAIN}`;
}
