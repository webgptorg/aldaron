import {
    createPodcastEpisodePlaybackProgress,
    getPodcastEpisodePlaybackStatus,
    getPodcastEpisodePlayedRatio,
    getPodcastEpisodeRemainingInSeconds,
    getPodcastEpisodeResumePositionInSeconds,
    isPodcastEpisodePlaybackProgress,
    PODCAST_EPISODE_RESUME_REWIND_IN_SECONDS,
    type PodcastEpisodePlaybackProgress,
} from '@/lib/podcast/podcastPlaybackProgress';
import { describe, expect, it } from 'vitest';

const EPISODE_DURATION_IN_SECONDS = 1800;

function createProgress(progress: Partial<PodcastEpisodePlaybackProgress> = {}): PodcastEpisodePlaybackProgress {
    return {
        positionInSeconds: 600,
        durationInSeconds: EPISODE_DURATION_IN_SECONDS,
        isPlayed: false,
        updatedAt: Date.parse('2026-08-30T12:00:00.000Z'),
        ...progress,
    };
}

describe('podcast episode playback progress', () => {
    it('marks an episode nobody started as unplayed', () => {
        expect(getPodcastEpisodePlaybackStatus(null)).toBe('unplayed');
    });

    it('does not mark an episode which was only opened for a moment', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: 3,
            durationInSeconds: EPISODE_DURATION_IN_SECONDS,
            isEnded: false,
        });

        expect(getPodcastEpisodePlaybackStatus(progress)).toBe('unplayed');
    });

    it('marks an episode which was left in the middle as partially played', () => {
        expect(getPodcastEpisodePlaybackStatus(createProgress())).toBe('partiallyPlayed');
    });

    it('marks an episode which ran out as played even before its length is known', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: 600,
            durationInSeconds: null,
            isEnded: true,
        });

        expect(getPodcastEpisodePlaybackStatus(progress)).toBe('played');
    });

    it('counts an episode left during its outro as heard to the end', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: EPISODE_DURATION_IN_SECONDS - 10,
            durationInSeconds: EPISODE_DURATION_IN_SECONDS,
            isEnded: false,
        });

        expect(getPodcastEpisodePlaybackStatus(progress)).toBe('played');
    });

    it('does not count the very beginning of a recording shorter than the outro it tolerates as its end', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: 2,
            durationInSeconds: 20,
            isEnded: false,
        });

        expect(progress.isPlayed).toBe(false);
    });

    it('resumes a few seconds before the listener was interrupted', () => {
        expect(getPodcastEpisodeResumePositionInSeconds(createProgress({ positionInSeconds: 600 }))).toBe(
            600 - PODCAST_EPISODE_RESUME_REWIND_IN_SECONDS,
        );
    });

    it('never resumes before the beginning of a recording', () => {
        expect(getPodcastEpisodeResumePositionInSeconds(createProgress({ positionInSeconds: 11 }))).toBe(6);
    });

    it('starts an episode which was already heard from its beginning again', () => {
        expect(getPodcastEpisodeResumePositionInSeconds(createProgress({ isPlayed: true }))).toBe(0);
    });

    it('starts an episode nobody left in the middle from its beginning', () => {
        expect(getPodcastEpisodeResumePositionInSeconds(null)).toBe(0);
    });

    it('never remembers a position beyond the end of the recording', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: EPISODE_DURATION_IN_SECONDS + 120,
            durationInSeconds: EPISODE_DURATION_IN_SECONDS,
            isEnded: true,
        });

        expect(progress.positionInSeconds).toBe(EPISODE_DURATION_IN_SECONDS);
    });

    it('ignores a length which an audio element does not know yet', () => {
        const progress = createPodcastEpisodePlaybackProgress({
            positionInSeconds: 42,
            durationInSeconds: Number.NaN,
            isEnded: false,
        });

        expect(progress.durationInSeconds).toBeNull();
    });

    it('says how much of a half-played episode is still ahead', () => {
        expect(getPodcastEpisodeRemainingInSeconds(createProgress(), EPISODE_DURATION_IN_SECONDS)).toBe(1200);
    });

    it('falls back to the length the feed states when the player never measured one', () => {
        const progress = createProgress({ durationInSeconds: null });

        expect(getPodcastEpisodeRemainingInSeconds(progress, EPISODE_DURATION_IN_SECONDS)).toBe(1200);
        expect(getPodcastEpisodePlayedRatio(progress, EPISODE_DURATION_IN_SECONDS)).toBeCloseTo(1 / 3);
    });

    it('knows nothing about what is ahead when no length is known at all', () => {
        const progress = createProgress({ durationInSeconds: null });

        expect(getPodcastEpisodeRemainingInSeconds(progress, null)).toBeNull();
        expect(getPodcastEpisodePlayedRatio(progress, null)).toBeNull();
    });

    it('shows an episode which was heard to the end as heard whole', () => {
        expect(getPodcastEpisodePlayedRatio(createProgress({ isPlayed: true, durationInSeconds: null }), null)).toBe(1);
    });

    it('reads a value which is not progress this application wrote as no progress', () => {
        expect(isPodcastEpisodePlaybackProgress(createProgress())).toBe(true);
        expect(isPodcastEpisodePlaybackProgress(null)).toBe(false);
        expect(isPodcastEpisodePlaybackProgress({ positionInSeconds: '600' })).toBe(false);
        expect(isPodcastEpisodePlaybackProgress({ ...createProgress(), positionInSeconds: -1 })).toBe(false);
        expect(isPodcastEpisodePlaybackProgress({ ...createProgress(), isPlayed: 'yes' })).toBe(false);
    });
});
