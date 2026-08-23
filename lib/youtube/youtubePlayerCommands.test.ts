/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { hideYoutubeVideoSubtitles, keepYoutubeVideoSubtitlesHidden, unmuteYoutubeVideo } from './youtubePlayerCommands';

/**
 * The player as far as the page is concerned: a frame which takes messages
 */
function createVideoFrame() {
    const postMessage = vi.fn();

    return {
        videoFrame: { contentWindow: { postMessage } } as unknown as HTMLIFrameElement,
        sentCommands: () => postMessage.mock.calls.map(([message]) => JSON.parse(message as string)),
    };
}

afterEach(() => vi.useRealTimers());

describe('commanding of a YouTube player', () => {
    it('turns the sound of the video on at full volume', () => {
        const { videoFrame, sentCommands } = createVideoFrame();

        unmuteYoutubeVideo(videoFrame);

        expect(sentCommands()).toEqual([
            { event: 'command', func: 'unMute', args: [] },
            { event: 'command', func: 'setVolume', args: [100] },
        ]);
    });

    it('unloads both subtitle modules the player can have', () => {
        const { videoFrame, sentCommands } = createVideoFrame();

        hideYoutubeVideoSubtitles(videoFrame);

        expect(sentCommands()).toEqual([
            { event: 'command', func: 'unloadModule', args: ['captions'] },
            { event: 'command', func: 'unloadModule', args: ['cc'] },
        ]);
    });

    it('keeps asking a player which does not listen yet, but not forever', () => {
        vi.useFakeTimers();
        const { videoFrame, sentCommands } = createVideoFrame();

        keepYoutubeVideoSubtitlesHidden(videoFrame);
        expect(sentCommands()).toHaveLength(2);

        vi.advanceTimersByTime(1000);
        expect(sentCommands()).toHaveLength(4);

        vi.advanceTimersByTime(60000);
        expect(sentCommands()).toHaveLength(22);
    });

    it('stops asking once the video is gone from the page', () => {
        vi.useFakeTimers();
        const { videoFrame, sentCommands } = createVideoFrame();

        const stopHiding = keepYoutubeVideoSubtitlesHidden(videoFrame);
        stopHiding();
        vi.advanceTimersByTime(60000);

        expect(sentCommands()).toHaveLength(2);
    });

    it('says nothing when there is no player to say it to', () => {
        expect(() => hideYoutubeVideoSubtitles(null)).not.toThrow();
        expect(() => unmuteYoutubeVideo(null)).not.toThrow();
    });
});
