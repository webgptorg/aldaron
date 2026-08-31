import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const COMMUNITY_MEMBERSHIP_CANCELLATION_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3600-community-membership-cancellation.sql',
);
const COMMUNITY_MEMBERSHIP_CANCELLATION_MIGRATION_SQL = readFileSync(
    COMMUNITY_MEMBERSHIP_CANCELLATION_MIGRATION_PATH,
    'utf8',
);

describe('community membership cancellation migration', () => {
    it('keeps a scheduled cancellation apart from the final membership status', () => {
        expect(COMMUNITY_MEMBERSHIP_CANCELLATION_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS is_cancellation_scheduled boolean NOT NULL DEFAULT false',
        );
    });
});
