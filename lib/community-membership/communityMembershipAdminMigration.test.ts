import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3500-community-membership-administration.sql',
);
const COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL = readFileSync(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_PATH, 'utf8');

describe('community membership administration migration', () => {
    it('pages and filters private payment records in the database before they reach the administrator', () => {
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain(
            'CREATE FUNCTION public.get_community_membership_admin_page(',
        );
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('target_search_query text DEFAULT');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('target_status text DEFAULT NULL');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('target_is_test_payment boolean DEFAULT NULL');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('count(*) OVER ()::bigint AS total_count');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('LIMIT target_limit');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('OFFSET target_offset');
    });

    it('does not grant payment-record access to browser database roles', () => {
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain(
            'REVOKE ALL ON FUNCTION public.get_community_membership_admin_page',
        );
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('FROM PUBLIC, anon, authenticated');
        expect(COMMUNITY_MEMBERSHIP_ADMIN_MIGRATION_SQL).toContain('TO service_role');
    });
});
