import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3700-subscription-discount-duration.sql',
);
const SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_SQL = readFileSync(
    SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_PATH,
    'utf8',
);

describe('subscription discount duration migration', () => {
    it('keeps existing codes permanent and returns the configured duration when a code is consumed', () => {
        expect(SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS subscription_discount_duration_months integer',
        );
        expect(SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_SQL).toContain('subscription_discount_duration_months IS NULL');
        expect(SUBSCRIPTION_DISCOUNT_DURATION_MIGRATION_SQL).toContain(
            'subscription_discount_duration_months integer\n)',
        );
    });
});
