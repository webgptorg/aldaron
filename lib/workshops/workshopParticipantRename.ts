import { WORKSHOP_COMMENT_TABLE_NAME, WORKSHOP_PARTICIPANT_TABLE_NAME } from '@/lib/workshops/workshopConstants';
import {
    mapWorkshopParticipantRow,
    WORKSHOP_PARTICIPANT_COLUMNS,
    type WorkshopParticipantRow,
} from '@/lib/workshops/workshopSession';
import type { WorkshopParticipant } from '@/lib/workshops/workshopTypes';
import type { SupabaseClient } from '@supabase/supabase-js';

type WorkshopParticipantRenameResult = {
    readonly participant: WorkshopParticipant;

    /**
     * Whether the new name reached a comment the whole room already sees, which is the only reason to refresh everyone
     */
    readonly isVisibleCommentRenamed: boolean;
};

type RenamedWorkshopCommentRow = {
    readonly status: string;
};

/**
 * Renames a participant everywhere their name is shown: in the room header and on every comment they wrote.
 *
 * Note: A comment keeps the author name it was written with, so the comments have to be rewritten as well. Comments
 *       waiting for moderation are renamed too, so that approving one later never publishes an outdated name.
 * Note: The comments are renamed after the participant, because a participant renamed with stale comments still leads
 *       to the name they asked for, while renamed comments of a participant who kept their old name would not.
 */
export async function renameWorkshopParticipant(
    supabase: SupabaseClient,
    workshopId: string,
    participantId: string,
    fullname: string,
): Promise<WorkshopParticipantRenameResult | null> {
    const { data: participantRow, error: participantError } = await supabase
        .from(WORKSHOP_PARTICIPANT_TABLE_NAME)
        .update({ fullname })
        .eq('id', participantId)
        .eq('workshop_id', workshopId)
        .select(WORKSHOP_PARTICIPANT_COLUMNS)
        .maybeSingle();

    if (participantError || participantRow === null) {
        console.error(
            'Failed to rename a workshop participant:',
            participantError?.message ?? 'No participant returned',
        );
        return null;
    }

    const participant = mapWorkshopParticipantRow(participantRow as WorkshopParticipantRow);
    const { data: renamedCommentRows, error: commentsError } = await supabase
        .from(WORKSHOP_COMMENT_TABLE_NAME)
        .update({ author_name: fullname })
        .eq('workshop_id', workshopId)
        .eq('participant_id', participantId)
        .neq('author_name', fullname)
        .select('status');

    if (commentsError) {
        // The participant already carries their new name, so the rename is reported as done and only the older
        // comments keep the previous one until the next rename succeeds.
        console.error('Failed to rename the comments of a workshop participant:', commentsError.message);
        return { participant, isVisibleCommentRenamed: false };
    }

    return {
        participant,
        isVisibleCommentRenamed: ((renamedCommentRows ?? []) as RenamedWorkshopCommentRow[]).some(
            ({ status }) => status === 'approved',
        ),
    };
}
