import { describe, expect, it } from 'vitest';
import { createYoutubeEmbedUrl, createYoutubeThumbnailUrl, extractYoutubeVideoId } from './youtubeEmbed';

describe('reading of a YouTube video', () => {
    it('takes a bare id as it is', () => {
        expect(extractYoutubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('reads the id out of every address YouTube shows', () => {
        expect(extractYoutubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
        expect(extractYoutubeVideoId('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('answers nothing when there is no video in the text', () => {
        expect(extractYoutubeVideoId('')).toBe(null);
        expect(extractYoutubeVideoId(null)).toBe(null);
        expect(extractYoutubeVideoId('https://www.youtube.com/')).toBe(null);
    });

    it('asks the player to start on its own', () => {
        expect(createYoutubeEmbedUrl('dQw4w9WgXcQ', { isAutoplayed: true })).toContain('autoplay=1');
        expect(createYoutubeEmbedUrl('dQw4w9WgXcQ', { isAutoplayed: false })).toContain('autoplay=0');
    });

    it('points at the widescreen still image of the video', () => {
        expect(createYoutubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        );
    });
});
