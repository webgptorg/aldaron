import type { CommunityPreviewDiscussionRow } from '@/lib/community/communityPreviewDatabase';
import type {
    CommunityPreviewDiscussion,
    CommunityPreviewPoll,
    CommunityPreviewProject,
} from '@/lib/community/communityPreviewTypes';
import type { CommunityProject } from '@/lib/community-projects/communityProjectTypes';
import { getFirstName } from '@/lib/getFirstName';
import { shortenText } from '@/lib/language/shortenText';
import { getWorkshopPollOptionVotePercentage, getWorkshopPollVoteCount } from '@/lib/workshops/workshopPollValues';
import type { WorkshopPoll, WorkshopPollOption } from '@/lib/workshops/workshopTypes';

const MAXIMAL_COMMUNITY_PREVIEW_MESSAGE_LENGTH = 190;
const MAXIMAL_COMMUNITY_PREVIEW_DESCRIPTION_LENGTH = 130;

/**
 * How the community names an author it does not know by name
 */
const UNNAMED_COMMUNITY_MEMBER_NAME = 'Člen komunity';

/**
 * Names a member the way a page anybody can open may name them
 *
 * Note: The room shows its members their full names, because they are in it together. A public page must not, so a
 *       member is named by their first name alone and a name which carries none at all is left unnamed.
 */
export function getPublicCommunityMemberName(fullname: string): string {
    const firstName = getFirstName(fullname);

    return firstName === '' ? UNNAMED_COMMUNITY_MEMBER_NAME : firstName;
}

export function createCommunityPreviewDiscussion(
    row: CommunityPreviewDiscussionRow,
    moderatorParticipantIds: ReadonlySet<string>,
): CommunityPreviewDiscussion {
    return {
        id: row.id,
        authorName: getPublicCommunityMemberName(row.author_name),
        isAuthorModerator: row.participant_id !== null && moderatorParticipantIds.has(row.participant_id),
        body: shortenText(row.body.trim(), MAXIMAL_COMMUNITY_PREVIEW_MESSAGE_LENGTH),
        createdAt: row.created_at,
    };
}

export function createCommunityPreviewProject(project: CommunityProject): CommunityPreviewProject {
    return {
        id: project.id,
        title: project.title,
        description: shortenText(project.description.trim(), MAXIMAL_COMMUNITY_PREVIEW_DESCRIPTION_LENGTH),
        authorName: getPublicCommunityMemberName(project.authorName),
        previewImageUrl: project.previewImageUrl,
        upvoteCount: project.upvoteCount,
    };
}

/**
 * How many answers of one poll a preview of it names
 */
const COMMUNITY_PREVIEW_POLL_ANSWER_COUNT = 3;

/**
 * The answers one poll received most often, from the most chosen one
 *
 * Note: An answer nobody chose is left out, because a preview of a poll is what the community said rather than what
 *       it was offered.
 */
function selectLeadingPollOptions(poll: WorkshopPoll): readonly WorkshopPollOption[] {
    return [...poll.options]
        .filter((option) => option.voteCount > 0)
        .sort((firstOption, secondOption) => secondOption.voteCount - firstOption.voteCount)
        .slice(0, COMMUNITY_PREVIEW_POLL_ANSWER_COUNT);
}

/**
 * Reduces one poll to the answers the community gave it most often
 *
 * Note: A poll nobody has answered says nothing about the community, so it becomes no preview at all rather than a
 *       question presented together with an empty result.
 */
export function createCommunityPreviewPoll(poll: WorkshopPoll): CommunityPreviewPoll | null {
    const voteCount = getWorkshopPollVoteCount(poll);
    const leadingOptions = selectLeadingPollOptions(poll);
    if (voteCount === 0 || leadingOptions.length === 0) {
        return null;
    }

    return {
        question: poll.question,
        answers: leadingOptions.map((option) => ({
            label: option.label,
            votePercentage: getWorkshopPollOptionVotePercentage(option, voteCount),
        })),
        voteCount,
    };
}

/**
 * Picks the poll a visitor learns the most from, which is the first answered one of the order the community reads
 */
export function selectCommunityPreviewPoll(polls: readonly WorkshopPoll[]): CommunityPreviewPoll | null {
    for (const poll of polls) {
        const previewPoll = createCommunityPreviewPoll(poll);
        if (previewPoll !== null) {
            return previewPoll;
        }
    }

    return null;
}
