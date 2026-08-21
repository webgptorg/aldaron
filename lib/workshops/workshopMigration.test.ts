import { DEFAULT_WORKSHOP_REACTIONS, MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT } from '@/lib/workshops/workshopConstants';
import { WORKSHOP_KIND_VALUES } from '@/lib/workshops/workshopTypes';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-0.sql');
const MIGRATION_SQL = readFileSync(MIGRATION_PATH, 'utf8');
const MODERATION_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-1.sql');
const MODERATION_MIGRATION_SQL = readFileSync(MODERATION_MIGRATION_PATH, 'utf8');
const ANALYTICS_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-2.sql');
const ANALYTICS_MIGRATION_SQL = readFileSync(ANALYTICS_MIGRATION_PATH, 'utf8');
const WATCHING_AND_REPLY_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-3.sql');
const WATCHING_AND_REPLY_MIGRATION_SQL = readFileSync(WATCHING_AND_REPLY_MIGRATION_PATH, 'utf8');
const PINNED_COMMENT_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-4.sql');
const PINNED_COMMENT_MIGRATION_SQL = readFileSync(PINNED_COMMENT_MIGRATION_PATH, 'utf8');
const DISABLED_PANEL_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-5.sql');
const DISABLED_PANEL_MIGRATION_SQL = readFileSync(DISABLED_PANEL_MIGRATION_PATH, 'utf8');
const REACTION_ANIMATION_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-6.sql');
const REACTION_ANIMATION_MIGRATION_SQL = readFileSync(REACTION_ANIMATION_MIGRATION_PATH, 'utf8');
const REACTION_COUNT_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0200-workshop-reaction-counts.sql',
);
const REACTION_COUNT_MIGRATION_SQL = readFileSync(REACTION_COUNT_MIGRATION_PATH, 'utf8');
const MULTIPLE_TERMS_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0100-online-workshop-multiple-terms.sql',
);
const MULTIPLE_TERMS_MIGRATION_SQL = readFileSync(MULTIPLE_TERMS_MIGRATION_PATH, 'utf8');
const ADMIN_ANALYTICS_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0300-workshop-admin-analytics.sql',
);
const ADMIN_ANALYTICS_MIGRATION_SQL = readFileSync(ADMIN_ANALYTICS_MIGRATION_PATH, 'utf8');
const COMMUNITY_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-08-0400-community.sql');
const COMMUNITY_MIGRATION_SQL = readFileSync(COMMUNITY_MIGRATION_PATH, 'utf8');
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

    it('records each participant action with a server timestamp and identity', () => {
        expect(MIGRATION_SQL).toMatch(/workshop_participants[\s\S]*connected_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(/workshop_comments[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(
            /workshop_comment_upvotes[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
        expect(MIGRATION_SQL).toMatch(
            /workshop_reactions[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
        expect(ANALYTICS_MIGRATION_SQL).toMatch(
            /workshop_content_link_clicks[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
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

    it('indexes the participants seen recently so the watching count stays cheap', () => {
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'CREATE INDEX IF NOT EXISTS workshop_participants_watching_idx',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'public.workshop_participants (workshop_id, last_seen_at DESC)',
        );
    });

    it('answers a comment within the same workshop and keeps the chat one level deep', () => {
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS parent_comment_id uuid');
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshop_comments_parent_fk FOREIGN KEY (parent_comment_id, workshop_id)',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'REFERENCES public.workshop_comments(id, workshop_id) ON DELETE CASCADE',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('WORKSHOP_COMMENT_REPLY_TOO_DEEP');
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('workshop_comments_enforce_reply_depth');
    });

    it('remembers a single pinned message per workshop and releases it with its message', () => {
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS pinned_comment_id uuid');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshops_pinned_comment_fk FOREIGN KEY (pinned_comment_id)',
        );
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('REFERENCES public.workshop_comments(id) ON DELETE SET NULL');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshops_pinned_comment_idx');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('WORKSHOP_PINNED_COMMENT_FOREIGN');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('workshops_enforce_pinned_comment_identity');
    });

    it('remembers the switched-off panels of a workshop and offers every other one without a backfill', () => {
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS disabled_panels text[] NOT NULL DEFAULT ARRAY[]::text[]',
        );
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('workshops_disabled_panels_keys');
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('cardinality(disabled_panels) <= 50');
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain("array_to_string(disabled_panels, ',')");

        // Note: Joining the array leaves a NULL element out instead of failing on it, so it is asked for on its own.
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('array_position(disabled_panels, NULL::text) IS NULL');
    });

    it('leaves room for every reaction which is celebrated its own way', () => {
        expect(REACTION_ANIMATION_MIGRATION_SQL).toContain('DROP CONSTRAINT IF EXISTS workshops_reactions_count');
        expect(REACTION_ANIMATION_MIGRATION_SQL).toContain(
            `CHECK (cardinality(allowed_reactions) BETWEEN 1 AND ${MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT})`,
        );
        expect(DEFAULT_WORKSHOP_REACTIONS.length).toBeLessThanOrEqual(MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT);
        DEFAULT_WORKSHOP_REACTIONS.forEach((reaction) => {
            expect(REACTION_ANIMATION_MIGRATION_SQL).toContain(reaction);
        });
    });

    it('counts each reaction text efficiently and returns the new total with its stored action', () => {
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('workshop_reactions_emoji_count_idx');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('ON public.workshop_reactions (workshop_id, emoji)');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('get_workshop_reaction_counts');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('GROUP BY workshop_reaction.emoji');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('create_workshop_reaction');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('target_participant_id IS NULL');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('workshop-reaction-count:');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('pg_advisory_xact_lock');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('total_reaction_count');
    });

    it('indexes published terms by their start for the public term list and legacy-room fallback', () => {
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshops_published_starts_at_idx');
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('ON public.workshops (starts_at ASC)');
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('WHERE is_published');
    });

    it('keeps a pin out of the revision of the workshop the administration edits', () => {
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('set_workshop_updated_at_except_pin');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain(
            "to_jsonb(NEW) - 'pinned_comment_id' - 'updated_at' = to_jsonb(OLD) - 'pinned_comment_id' - 'updated_at'",
        );
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('NEW.updated_at = OLD.updated_at');
    });

    it('pages and orders a large workshop audience in the database while keeping timeline queries indexed', () => {
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('get_workshop_admin_participant_page');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('target_limit integer DEFAULT 50');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('target_offset integer DEFAULT 0');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('WORKSHOP_PARTICIPANT_SORT_INVALID');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_admin_filter_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_fullname_trigram_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_email_trigram_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_comments_participant_timeline_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_reactions_participant_timeline_idx');
    });

    it('aggregates workshop actions into private time buckets for the administration', () => {
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('get_workshop_admin_timeline');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('date_bin(');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'participant'::text AS event_kind");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'comment'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'reaction'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'upvote'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'link_click'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline');
    });

    it('keeps one persistent community separate from workshop occurrences', () => {
        expect(COMMUNITY_MIGRATION_SQL).toContain("ADD COLUMN IF NOT EXISTS room_kind text NOT NULL DEFAULT 'workshop'");
        expect(COMMUNITY_MIGRATION_SQL).toContain('workshops_room_kind');
        WORKSHOP_KIND_VALUES.forEach((workshopKind) => expect(COMMUNITY_MIGRATION_SQL).toContain(`'${workshopKind}'`));
        expect(COMMUNITY_MIGRATION_SQL).toContain('CREATE UNIQUE INDEX IF NOT EXISTS workshops_one_community_idx');
        expect(COMMUNITY_MIGRATION_SQL).toContain("WHERE room_kind = 'community'");
        expect(COMMUNITY_MIGRATION_SQL).toContain('workshops_community_slug');
        expect(COMMUNITY_MIGRATION_SQL).toContain("'komunita'");
    });
});
