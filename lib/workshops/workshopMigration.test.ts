import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-0.sql');
const MIGRATION_SQL = readFileSync(MIGRATION_PATH, 'utf8');
const MODERATION_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-1.sql');
const MODERATION_MIGRATION_SQL = readFileSync(MODERATION_MIGRATION_PATH, 'utf8');
const ANALYTICS_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-2.sql');
const ANALYTICS_MIGRATION_SQL = readFileSync(ANALYTICS_MIGRATION_PATH, 'utf8');
const WORKSHOP_TABLE_NAMES = [
    'workshops',
    'workshop_content_blocks',
    'workshop_participants',
    'workshop_comments',
    'workshop_comment_upvotes',
    'workshop_reactions',
] as const;

describe('workshop database migration', () => {
    it('creates every reusable workshop table', () => {
        WORKSHOP_TABLE_NAMES.forEach((tableName) => {
            expect(MIGRATION_SQL).toContain(`CREATE TABLE IF NOT EXISTS public.${tableName}`);
        });
    });

    it('forces RLS and removes browser roles from all workshop tables', () => {
        expect(MIGRATION_SQL).toContain('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY');
        expect(MIGRATION_SQL).toContain('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated');
        expect(MIGRATION_SQL).toContain('GRANT ALL ON TABLE public.%I TO service_role');
    });

    it('persists timestamps and user identity for participant activity', () => {
        expect(MIGRATION_SQL).toMatch(/workshop_participants[\s\S]*connected_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(/workshop_comments[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(
            /workshop_comment_upvotes[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
        expect(MIGRATION_SQL).toMatch(
            /workshop_reactions[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
    });

    it('defaults chat messages to pending and atomically limits action bursts', () => {
        expect(MIGRATION_SQL).toContain("status text NOT NULL DEFAULT 'pending'");
        expect(MIGRATION_SQL).toContain('workshop_comments_enforce_rate_limit');
        expect(MIGRATION_SQL).toContain('workshop_reactions_enforce_rate_limit');
        expect(MIGRATION_SQL).toContain('pg_advisory_xact_lock');
    });

    it('keeps upvotes attributable and maintains their denormalized count in the database', () => {
        expect(MIGRATION_SQL).toContain(
            'CONSTRAINT workshop_comment_upvotes_one_per_participant UNIQUE (comment_id, participant_id)',
        );
        expect(MIGRATION_SQL).toContain('workshop_comment_upvotes_participant_fk');
        expect(MIGRATION_SQL).toContain('workshop_comment_upvotes_update_count');
        expect(MIGRATION_SQL).toContain('upvote_count = upvote_count + 1');
    });

    it('allows anonymous clients to receive workshop broadcasts but not author them', () => {
        const policyStart = MIGRATION_SQL.indexOf('CREATE POLICY workshop_broadcasts_are_receive_only');
        const policyEnd = MIGRATION_SQL.indexOf('INSERT INTO public.workshops', policyStart);
        const realtimePolicySql = MIGRATION_SQL.slice(policyStart, policyEnd);

        expect(realtimePolicySql).toContain('FOR SELECT');
        expect(realtimePolicySql).toContain('TO anon, authenticated');
        expect(realtimePolicySql).not.toContain('FOR INSERT');
    });

    it('marks artificial actions and participant interaction bans in the follow-up migration', () => {
        expect(MODERATION_MIGRATION_SQL).toContain('is_interaction_banned boolean NOT NULL DEFAULT false');
        expect(MODERATION_MIGRATION_SQL).toContain('is_artificial boolean NOT NULL DEFAULT false');
        expect(MODERATION_MIGRATION_SQL).toContain('artificial_upvote_count integer NOT NULL DEFAULT 0');
        expect(MODERATION_MIGRATION_SQL).toContain('ALTER COLUMN participant_id DROP NOT NULL');
        expect(MODERATION_MIGRATION_SQL).toContain('adjust_workshop_comment_artificial_upvotes');
        expect(MODERATION_MIGRATION_SQL).toContain('IF NEW.is_artificial THEN');
    });

    it('stores trusted moderation, active time, and material link clicks in the final migration', () => {
        expect(ANALYTICS_MIGRATION_SQL).toContain('is_trusted boolean NOT NULL DEFAULT false');
        expect(ANALYTICS_MIGRATION_SQL).toContain('active_duration_seconds integer NOT NULL DEFAULT 0');
        expect(ANALYTICS_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_content_link_clicks');
        expect(ANALYTICS_MIGRATION_SQL).toContain('record_workshop_participant_presence');
        expect(ANALYTICS_MIGRATION_SQL).toContain('get_workshop_participant_activity_totals');
    });
});
