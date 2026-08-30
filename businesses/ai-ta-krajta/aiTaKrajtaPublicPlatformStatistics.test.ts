import {
    createAiTaKrajtaYoutubeAboutUrl,
    parseAiTaKrajtaApplePodcastReviewCount,
    parseAiTaKrajtaInstagramFollowerCount,
    parseAiTaKrajtaLinkedInFollowerCount,
    parseAiTaKrajtaPublicCount,
    parseAiTaKrajtaYoutubeChannelStatistics,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPublicPlatformStatistics';
import { describe, expect, it } from 'vitest';

const YOUTUBE_ABOUT_DOCUMENT = `<script>
    var ytInitialData = {
        "subscriberCountText":"1,84 tis. odběratelů",
        "viewCountText":"93 818 zhlédnutí",
        "videoCountText":"102 videí"
    };
</script>`;

const LINKEDIN_PROFILE_DOCUMENT = `<meta property="og:description" content="AI ta Krajta | 894 followers on LinkedIn. Vše o AI na jednom místě.">`;
const INSTAGRAM_PROFILE_DOCUMENT = `<meta content="17 Followers, 3 Following, 1 Posts - AI ta Krajta" property="og:description">`;
const APPLE_PODCASTS_DOCUMENT = `<script type="application/ld+json">{"aggregateRating":{"reviewCount":3}}</script>`;

describe('createAiTaKrajtaYoutubeAboutUrl', () => {
    it('opens the public about tab without creating a double slash', () => {
        expect(createAiTaKrajtaYoutubeAboutUrl('https://www.youtube.com/@aitakrajta_tv/')).toBe(
            'https://www.youtube.com/@aitakrajta_tv/about',
        );
    });
});

describe('parseAiTaKrajtaPublicCount', () => {
    it.each([
        ['1,84 tis. odběratelů', 1_840],
        ['1.84K subscribers', 1_840],
        ['93 818 zhlédnutí', 93_818],
        ['1,2 mil. zhlédnutí', 1_200_000],
        ['894 followers', 894],
    ])('reads %s as %i', (countText, expectedCount) => {
        expect(parseAiTaKrajtaPublicCount(countText)).toBe(expectedCount);
    });

    it('does not invent a count from text which has none', () => {
        expect(parseAiTaKrajtaPublicCount('bez veřejného počtu')).toBeNull();
    });
});

describe('public platform statistics parsers', () => {
    it('reads the channel-wide YouTube statistics', () => {
        expect(parseAiTaKrajtaYoutubeChannelStatistics(YOUTUBE_ABOUT_DOCUMENT)).toEqual({
            youtubeSubscriberCount: 1_840,
            youtubeViewCount: 93_818,
            youtubeVideoCount: 102,
        });
    });

    it('reads the public social follow counts from Open Graph descriptions', () => {
        expect(parseAiTaKrajtaLinkedInFollowerCount(LINKEDIN_PROFILE_DOCUMENT)).toBe(894);
        expect(parseAiTaKrajtaInstagramFollowerCount(INSTAGRAM_PROFILE_DOCUMENT)).toBe(17);
        expect(
            parseAiTaKrajtaLinkedInFollowerCount(
                '<meta property="og:description" content="AI ta Krajta | 1 200 sledujících na LinkedInu.">',
            ),
        ).toBe(1_200);
        expect(
            parseAiTaKrajtaInstagramFollowerCount(
                '<meta property="og:description" content="25 sledujících, 3 sledovaní – AI ta Krajta">',
            ),
        ).toBe(25);
    });

    it('uses an Apple review as a real but deliberately small public listener signal', () => {
        expect(parseAiTaKrajtaApplePodcastReviewCount(APPLE_PODCASTS_DOCUMENT)).toBe(3);
    });

    it('keeps an unreadable source unknown instead of treating it as no audience', () => {
        expect(parseAiTaKrajtaYoutubeChannelStatistics(null)).toEqual({
            youtubeSubscriberCount: null,
            youtubeViewCount: null,
            youtubeVideoCount: null,
        });
        expect(parseAiTaKrajtaLinkedInFollowerCount(null)).toBeNull();
        expect(parseAiTaKrajtaInstagramFollowerCount(null)).toBeNull();
        expect(parseAiTaKrajtaApplePodcastReviewCount(null)).toBeNull();
    });
});
