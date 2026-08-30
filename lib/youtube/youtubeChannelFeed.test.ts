import { createPodcastEpisodesFromYoutubeVideos } from '@/lib/podcast/podcastEpisodesFromYoutube';
import { createYoutubeChannelFeedUrl, parseYoutubeChannelFeed } from '@/lib/youtube/youtubeChannelFeed';
import { describe, expect, it } from 'vitest';

const EXAMPLE_CHANNEL_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>AI ta Krajta</title>
 <entry>
  <id>yt:video:aaaaaaaaaaa</id>
  <yt:videoId>aaaaaaaaaaa</yt:videoId>
  <title>Qwen 3.8 u&#38;#382; ukazuje budoucnost lok&#225;ln&#237; AI</title>
  <link rel="alternate" href="https://www.youtube.com/shorts/aaaaaaaaaaa"/>
  <published>2026-08-28T15:00:13+00:00</published>
  <media:group>
   <media:thumbnail url="https://i3.ytimg.com/vi/aaaaaaaaaaa/hqdefault.jpg" width="480" height="360"/>
   <media:description>Kr&#225;tk&#253; sest&#345;ih.</media:description>
  </media:group>
 </entry>
 <entry>
  <id>yt:video:bbbbbbbbbbb</id>
  <yt:videoId>bbbbbbbbbbb</yt:videoId>
  <title>AI ta Krajta #65 | AI zrychl&#237; v&#253;voj 10x</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=bbbbbbbbbbb"/>
  <published>2026-08-28T14:00:38+00:00</published>
  <media:group>
   <media:thumbnail url="https://i3.ytimg.com/vi/bbbbbbbbbbb/hqdefault.jpg" width="480" height="360"/>
   <media:description>&#128293; Dal&#353;&#237; d&#237;l! Odkaz: https://example.com/x #aitakrajta</media:description>
  </media:group>
 </entry>
 <entry>
  <id>yt:video:ccccccccccc</id>
  <yt:videoId>ccccccccccc</yt:videoId>
  <title>Ochutn&#225;vka z na&#353;eho workshopu</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=ccccccccccc"/>
  <published>2026-08-20T14:00:00+00:00</published>
 </entry>
</feed>`;

describe('createYoutubeChannelFeedUrl', () => {
    it('asks YouTube for the feed of one channel', () => {
        expect(createYoutubeChannelFeedUrl('UC5Tbrm0RPCqaye9Nf5qIYGQ')).toBe(
            'https://www.youtube.com/feeds/videos.xml?channel_id=UC5Tbrm0RPCqaye9Nf5qIYGQ',
        );
    });
});

describe('parseYoutubeChannelFeed', () => {
    const videos = parseYoutubeChannelFeed(EXAMPLE_CHANNEL_FEED);

    it('reads every video of the channel, newest first', () => {
        expect(videos.map((video) => video.videoId)).toEqual(['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
    });

    it('tells a short from a full video by the address it is linked under', () => {
        expect(videos.map((video) => video.isShort)).toEqual([true, false, false]);
    });

    it('reads what a video says about itself', () => {
        expect(videos[1]).toMatchObject({
            title: 'AI ta Krajta #65 | AI zrychlí vývoj 10x',
            publishedAt: '2026-08-28T14:00:38.000Z',
            thumbnailUrl: 'https://i3.ytimg.com/vi/bbbbbbbbbbb/hqdefault.jpg',
        });
    });

    it('reads the description of a video without its links and hashtags', () => {
        expect(videos[1].description).toBe('Další díl! Odkaz:');
    });

    it('reads a feed which could not be fetched as a channel without videos', () => {
        expect(parseYoutubeChannelFeed('')).toEqual([]);
    });
});

describe('createPodcastEpisodesFromYoutubeVideos', () => {
    const episodes = createPodcastEpisodesFromYoutubeVideos(parseYoutubeChannelFeed(EXAMPLE_CHANNEL_FEED));

    it('keeps the videos which are numbered episodes and leaves the rest of the channel out', () => {
        expect(episodes.map((episode) => episode.number)).toEqual([65]);
    });

    it('says where the episode is watched', () => {
        expect(episodes[0].videoUrl).toBe('https://www.youtube.com/watch?v=bbbbbbbbbbb');
    });
});
