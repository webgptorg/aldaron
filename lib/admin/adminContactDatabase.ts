import {
    createAdminContactGroups,
    createAdminJoinedContacts,
    type AdminContactGroup,
    type AdminJoinedContact,
    type AdminWorkshopParticipation,
} from '@/lib/admin/adminContactJoin';
import { CONTACT_TABLE_NAME, loadContacts } from '@/lib/contacts/contactsDatabase';
import { loadAllSupabaseRows } from '@/lib/supabase/loadAllSupabaseRows';
import { WORKSHOP_PARTICIPANT_TABLE_NAME, WORKSHOP_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import type { WorkshopKind } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

const ADMIN_CONTACT_WORKSHOP_COLUMNS = 'id, room_kind, title, starts_at, ends_at';
const ADMIN_CONTACT_WORKSHOP_PARTICIPANT_COLUMNS =
    'id, workshop_id, fullname, email, connected_at, last_seen_at, active_duration_seconds, is_interaction_banned, is_trusted';

type AdminContactWorkshopRow = {
    readonly id: string;
    readonly room_kind: WorkshopKind;
    readonly title: string;
    readonly starts_at: string;
    readonly ends_at: string | null;
};

type AdminContactWorkshopParticipantRow = {
    readonly id: string;
    readonly workshop_id: string;
    readonly fullname: string;
    readonly email: string;
    readonly connected_at: string;
    readonly last_seen_at: string;
    readonly active_duration_seconds: number;
    readonly is_interaction_banned: boolean;
    readonly is_trusted: boolean;
};

type AdminContactWorkshopParticipantActivityTotalsRow = {
    readonly workshop_id: string;
    readonly participant_id: string;
    readonly comment_count: number | string;
    readonly reaction_count: number | string;
    readonly link_click_count: number | string;
    readonly upvote_count: number | string;
};

type LoadedAdminContactGroups = {
    readonly groups: readonly AdminContactGroup[] | null;
    readonly errorMessage: string | null;
};

type LoadedAdminJoinedContacts = {
    readonly contacts: readonly AdminJoinedContact[] | null;
    readonly errorMessage: string | null;
};

type LoadAdminContactGroupsOptions = {
    readonly isLoadingAll: boolean;

    /**
     * Whether this screen needs the complete cross-workshop attendance history, rather than only Contact-table fields.
     */
    readonly isWorkshopParticipationsIncluded?: boolean;
};

function getNonNegativeWholeNumber(value: number | string | undefined): number {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return Number.isSafeInteger(numericValue) && numericValue >= 0 ? numericValue : 0;
}

function createWorkshopParticipantActivityTotalsKey(workshopId: string, participantId: string): string {
    return `${workshopId}:${participantId}`;
}

function mapAdminWorkshopParticipation(
    participantRow: AdminContactWorkshopParticipantRow,
    workshopById: ReadonlyMap<string, AdminContactWorkshopRow>,
    activityTotalsByParticipationKey: ReadonlyMap<string, AdminContactWorkshopParticipantActivityTotalsRow>,
): AdminWorkshopParticipation | null {
    const workshopRow = workshopById.get(participantRow.workshop_id);
    if (workshopRow === undefined) {
        return null;
    }

    const activityTotals = activityTotalsByParticipationKey.get(
        createWorkshopParticipantActivityTotalsKey(participantRow.workshop_id, participantRow.id),
    );

    return {
        participantId: participantRow.id,
        workshopId: workshopRow.id,
        workshopKind: workshopRow.room_kind,
        workshopTitle: workshopRow.title,
        workshopStartsAt: workshopRow.starts_at,
        workshopEndsAt: workshopRow.ends_at,
        fullname: participantRow.fullname,
        email: participantRow.email,
        connectedAt: participantRow.connected_at,
        lastSeenAt: participantRow.last_seen_at,
        activeDurationSeconds: participantRow.active_duration_seconds,
        commentCount: getNonNegativeWholeNumber(activityTotals?.comment_count),
        reactionCount: getNonNegativeWholeNumber(activityTotals?.reaction_count),
        linkClickCount: getNonNegativeWholeNumber(activityTotals?.link_click_count),
        upvoteCount: getNonNegativeWholeNumber(activityTotals?.upvote_count),
        isInteractionBanned: participantRow.is_interaction_banned,
        isTrusted: participantRow.is_trusted,
    };
}

/**
 * Read the already-aggregated activity of every workshop participant in one stable, paged query.
 *
 * The workshop participant page uses the very same database aggregate for one workshop. This multi-workshop variant
 * lets the contact history stay complete without issuing a query for every workshop occurrence.
 */
async function loadAdminWorkshopParticipantActivityTotals(
    supabase: SupabaseClient,
    workshopIds: readonly string[],
): Promise<{
    readonly activityTotals: readonly AdminContactWorkshopParticipantActivityTotalsRow[] | null;
    readonly errorMessage: string | null;
}> {
    if (workshopIds.length === 0) {
        return { activityTotals: [], errorMessage: null };
    }

    const { rows, errorMessage } = await loadAllSupabaseRows<AdminContactWorkshopParticipantActivityTotalsRow>(
        (fromIndex, toIndex) =>
            supabase
                .rpc('get_workshop_participant_activity_totals_for_workshops', {
                    target_workshop_ids: workshopIds,
                })
                .order('workshop_id', { ascending: true })
                .order('participant_id', { ascending: true })
                .range(fromIndex, toIndex),
        '`get_workshop_participant_activity_totals_for_workshops`',
    );

    return { activityTotals: rows, errorMessage };
}

/**
 * Read every workshop attendance needed by the admin-only contact projection.
 *
 * The source records remain separate and are joined after both pages are read, because the requested normalization is
 * intentionally a presentation rule rather than a new database key.
 */
async function loadAdminWorkshopParticipations(
    supabase: SupabaseClient,
): Promise<{ readonly workshopParticipations: readonly AdminWorkshopParticipation[] | null; readonly errorMessage: string | null }> {
    const [workshopRowsResult, participantRowsResult] = await Promise.all([
        loadAllSupabaseRows<AdminContactWorkshopRow>(
            (fromIndex, toIndex) =>
                supabase
                    .from(WORKSHOP_TABLE_NAME)
                    .select(ADMIN_CONTACT_WORKSHOP_COLUMNS)
                    .order('starts_at', { ascending: false })
                    .range(fromIndex, toIndex),
            `the workshops of the contact join, from \`${WORKSHOP_TABLE_NAME}\``,
        ),
        loadAllSupabaseRows<AdminContactWorkshopParticipantRow>(
            (fromIndex, toIndex) =>
                supabase
                    .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
                    .select(ADMIN_CONTACT_WORKSHOP_PARTICIPANT_COLUMNS)
                    .order('connected_at', { ascending: false })
                    .range(fromIndex, toIndex),
            `the attendances of the contact join, from \`${WORKSHOP_PARTICIPANT_TABLE_NAME}\``,
        ),
    ]);

    const sourceErrorMessage = workshopRowsResult.errorMessage ?? participantRowsResult.errorMessage;
    if (workshopRowsResult.rows === null || participantRowsResult.rows === null) {
        return { workshopParticipations: null, errorMessage: sourceErrorMessage };
    }

    const workshopById = new Map<string, AdminContactWorkshopRow>(
        workshopRowsResult.rows.map((workshopRow) => [workshopRow.id, workshopRow] as const),
    );
    const activityTotalsResult = await loadAdminWorkshopParticipantActivityTotals(
        supabase,
        workshopRowsResult.rows.map((workshopRow) => workshopRow.id),
    );
    if (activityTotalsResult.activityTotals === null) {
        return { workshopParticipations: null, errorMessage: activityTotalsResult.errorMessage };
    }

    const activityTotalsByParticipationKey = new Map<string, AdminContactWorkshopParticipantActivityTotalsRow>(
        activityTotalsResult.activityTotals.map(
            (activityTotals) =>
                [
                    createWorkshopParticipantActivityTotalsKey(
                        activityTotals.workshop_id,
                        activityTotals.participant_id,
                    ),
                    activityTotals,
                ] as const,
        ),
    );
    const workshopParticipations = participantRowsResult.rows
        .map((participantRow) =>
            mapAdminWorkshopParticipation(participantRow, workshopById, activityTotalsByParticipationKey),
        )
        .filter((workshopParticipation): workshopParticipation is AdminWorkshopParticipation => workshopParticipation !== null);

    return { workshopParticipations, errorMessage: null };
}

/**
 * Read the identity groups which every authenticated admin contact view shares.
 */
export async function loadAdminContactGroups(
    supabase: SupabaseClient,
    options: LoadAdminContactGroupsOptions = { isLoadingAll: true },
): Promise<LoadedAdminContactGroups> {
    const isWorkshopParticipationsIncluded = options.isWorkshopParticipationsIncluded !== false;
    const [loadedContacts, loadedWorkshopParticipations] = await Promise.all([
        loadContacts(supabase.from(CONTACT_TABLE_NAME), { isLoadingAll: options.isLoadingAll }),
        isWorkshopParticipationsIncluded
            ? loadAdminWorkshopParticipations(supabase)
            : Promise.resolve({ workshopParticipations: [], errorMessage: null }),
    ]);

    const errorMessage = loadedContacts.errorMessage ?? loadedWorkshopParticipations.errorMessage;
    if (loadedContacts.contacts === null || loadedWorkshopParticipations.workshopParticipations === null) {
        return { groups: null, errorMessage };
    }

    return {
        groups: createAdminContactGroups(loadedContacts.contacts, loadedWorkshopParticipations.workshopParticipations),
        errorMessage: null,
    };
}

/**
 * Read the grouped Contact-table projection used by the contacts dashboard and its exports.
 */
export async function loadAdminJoinedContacts(
    supabase: SupabaseClient,
    options: LoadAdminContactGroupsOptions = { isLoadingAll: true },
): Promise<LoadedAdminJoinedContacts> {
    const { groups, errorMessage } = await loadAdminContactGroups(supabase, options);
    if (groups === null) {
        return { contacts: null, errorMessage };
    }

    return { contacts: createAdminJoinedContacts(groups), errorMessage: null };
}
