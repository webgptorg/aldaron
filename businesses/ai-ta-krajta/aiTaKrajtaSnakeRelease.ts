/**
 * How long the exact logo remains on screen after it has been clicked
 *
 * Keeping the mark still for a beat makes the click feel intentional and, more importantly, prevents the simulated
 * snake from travelling away while its exact artwork is still visible.
 */
export const AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS = 320;

/**
 * How long the exact head and neck dissolve into the moving head and neck
 */
export const AI_TA_KRAJTA_SNAKE_HEAD_AND_NECK_TRANSITION_DURATION_IN_MILLISECONDS = 180;

/**
 * How long the coiled logo body remains visible after the head starts moving
 */
export const AI_TA_KRAJTA_SNAKE_BODY_HOLD_DURATION_IN_MILLISECONDS = 780;

/**
 * How long the coiled logo body yields to the now-uncoiled playable body
 */
export const AI_TA_KRAJTA_SNAKE_BODY_TRANSITION_DURATION_IN_MILLISECONDS = 480;

/**
 * What each visual layer and the simulation should do at one moment of the release
 */
export type AiTaKrajtaSnakeReleaseFrame = {
    readonly logoBodyOpacity: number;
    readonly logoHeadAndNeckOpacity: number;
    readonly snakeOpacity: number;
    readonly foodOpacity: number;
    readonly isSimulationRunning: boolean;
    readonly isGameInterfaceVisible: boolean;
};

/**
 * Keeps an animation progress within its useful range
 */
function clampProgress(value: number): number {
    return Math.min(1, Math.max(0, value));
}

/**
 * Makes the change in opacity start and finish without a visible jerk
 */
function easeInOutProgress(progress: number): number {
    return progress * progress * (3 - 2 * progress);
}

/**
 * Plans the uncoiling handoff from the canonical logo to the playable snake
 *
 * Note: The exact coiled body stays over the simulated body while the head moves away from it. This lets the playable
 *       snake emerge from the real logo instead of exposing an approximate, coiled simulation beneath it.
 */
export function getAiTaKrajtaSnakeReleaseFrame(elapsedInMilliseconds: number): AiTaKrajtaSnakeReleaseFrame {
    const elapsedSinceSimulationStartedInMilliseconds = Math.max(
        0,
        elapsedInMilliseconds - AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS,
    );
    const headAndNeckTransitionProgress = clampProgress(
        elapsedSinceSimulationStartedInMilliseconds /
            AI_TA_KRAJTA_SNAKE_HEAD_AND_NECK_TRANSITION_DURATION_IN_MILLISECONDS,
    );
    const bodyTransitionProgress = clampProgress(
        (elapsedSinceSimulationStartedInMilliseconds - AI_TA_KRAJTA_SNAKE_BODY_HOLD_DURATION_IN_MILLISECONDS) /
            AI_TA_KRAJTA_SNAKE_BODY_TRANSITION_DURATION_IN_MILLISECONDS,
    );
    const isSimulationRunning = elapsedInMilliseconds > AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS;
    const isGameInterfaceVisible = headAndNeckTransitionProgress === 1;
    const easedHeadAndNeckTransitionProgress = easeInOutProgress(headAndNeckTransitionProgress);
    const easedBodyTransitionProgress = easeInOutProgress(bodyTransitionProgress);

    return {
        logoBodyOpacity: 1 - easedBodyTransitionProgress,
        logoHeadAndNeckOpacity: 1 - easedHeadAndNeckTransitionProgress,
        snakeOpacity: easedHeadAndNeckTransitionProgress,
        foodOpacity: easedBodyTransitionProgress,
        isSimulationRunning,
        isGameInterfaceVisible,
    };
}
