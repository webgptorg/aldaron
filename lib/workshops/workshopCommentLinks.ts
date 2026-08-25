/**
 * A chat link earns its active rendering only when it comes from a room
 * moderator or from the administration's explicit artificial-message tool.
 * Everybody else keeps the original safe, inert chat formatting.
 */
export function areWorkshopCommentLinksEnabled(comment: {
    readonly isArtificial: boolean;
    readonly isAuthorModerator: boolean;
}): boolean {
    return comment.isArtificial || comment.isAuthorModerator;
}
