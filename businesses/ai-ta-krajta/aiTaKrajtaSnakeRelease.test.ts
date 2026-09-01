import {
    AI_TA_KRAJTA_SNAKE_BODY_HOLD_DURATION_IN_MILLISECONDS,
    AI_TA_KRAJTA_SNAKE_BODY_TRANSITION_DURATION_IN_MILLISECONDS,
    AI_TA_KRAJTA_SNAKE_HEAD_AND_NECK_TRANSITION_DURATION_IN_MILLISECONDS,
    AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS,
    getAiTaKrajtaSnakeReleaseFrame,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeRelease';
import { describe, expect, it } from 'vitest';

describe('AI ta Krajta snake release', () => {
    it('keeps the canonical logo intact before the playable snake appears', () => {
        expect(getAiTaKrajtaSnakeReleaseFrame(0)).toEqual({
            logoBodyOpacity: 1,
            logoHeadAndNeckOpacity: 1,
            snakeOpacity: 0,
            foodOpacity: 0,
            isSimulationRunning: false,
            isGameInterfaceVisible: false,
        });

        expect(
            getAiTaKrajtaSnakeReleaseFrame(AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS),
        ).toEqual({
            logoBodyOpacity: 1,
            logoHeadAndNeckOpacity: 1,
            snakeOpacity: 0,
            foodOpacity: 0,
            isSimulationRunning: false,
            isGameInterfaceVisible: false,
        });
    });

    it('lets the head uncoil before the exact body turns into the playable one', () => {
        const completedHeadAndNeckTransition =
            AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS +
            AI_TA_KRAJTA_SNAKE_HEAD_AND_NECK_TRANSITION_DURATION_IN_MILLISECONDS;
        const completedBodyTransition =
            AI_TA_KRAJTA_SNAKE_LOGO_HOLD_DURATION_IN_MILLISECONDS +
            AI_TA_KRAJTA_SNAKE_BODY_HOLD_DURATION_IN_MILLISECONDS +
            AI_TA_KRAJTA_SNAKE_BODY_TRANSITION_DURATION_IN_MILLISECONDS;

        expect(getAiTaKrajtaSnakeReleaseFrame(completedHeadAndNeckTransition)).toEqual({
            logoBodyOpacity: 1,
            logoHeadAndNeckOpacity: 0,
            snakeOpacity: 1,
            foodOpacity: 0,
            isSimulationRunning: true,
            isGameInterfaceVisible: true,
        });
        expect(getAiTaKrajtaSnakeReleaseFrame(completedBodyTransition)).toEqual({
            logoBodyOpacity: 0,
            logoHeadAndNeckOpacity: 0,
            snakeOpacity: 1,
            foodOpacity: 1,
            isSimulationRunning: true,
            isGameInterfaceVisible: true,
        });
    });
});
