import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Public route of the podcast home page.
 */
export const AI_TA_KRAJTA_PATH = '/ai-ta-krajta';

/**
 * Name used by the podcast across the page, metadata and structured data.
 */
export const AI_TA_KRAJTA_NAME = 'AI ta Krajta';

/**
 * Short category used where a visitor needs to understand the format at a glance.
 */
export const AI_TA_KRAJTA_KIND = 'Český video podcast o AI';

/**
 * Existing cover artwork, also shared with Pavol Hejný's media list.
 */
export const AI_TA_KRAJTA_COVER_IMAGE_PATH = '/pavol/media/ai-ta-krajta.jpg';

/**
 * Colors taken from the existing cover so the page and its generated preview stay recognizably related.
 */
export const AI_TA_KRAJTA_COLORS = {
    DARK: '#303832',
    DARKER: '#171d1a',
    CORAL: '#ff6b6b',
    VIOLET: '#6b8cff',
    PAPER: '#f8f7f1',
} as const;

/**
 * One sentence that explains the regular rhythm and subject of the show.
 */
export const AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'Vše o AI na jednom místě, každý týden. Novinky, zajímavosti a diskuze z oblasti umělé inteligence.',
    en: 'Everything about AI in one place, every week. News, interesting finds, and discussions about artificial intelligence.',
};

/**
 * Public profiles where people can follow the podcast in the format they prefer.
 */
export const AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@aitakrajta_tv';
export const AI_TA_KRAJTA_SPOTIFY_SHOW_URL = 'https://open.spotify.com/show/31vLTHTV4vlCBeHpnbMKlK';
export const AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL = 'https://podcasts.apple.com/cz/podcast/ai-ta-krajta/id1813389353';
export const AI_TA_KRAJTA_LINKEDIN_URL = 'https://www.linkedin.com/company/aitakrajta';

export type AiTaKrajtaPlatformId = 'youtube' | 'spotify' | 'applePodcasts';

export type AiTaKrajtaPlatform = {
    readonly id: AiTaKrajtaPlatformId;
    readonly label: string;
    readonly description: string;
    readonly href: string;
};

/**
 * Platforms in the exact order in which the page introduces them.
 */
export const AI_TA_KRAJTA_PLATFORM_LINKS = [
    {
        id: 'youtube',
        label: 'YouTube',
        description: 'Video, komentáře a celý archiv.',
        href: AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
    },
    {
        id: 'spotify',
        label: 'Spotify',
        description: 'Audio do sluchátek, auta i fronty na kávu.',
        href: AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
    },
    {
        id: 'applePodcasts',
        label: 'Apple Podcasts',
        description: 'Když máte podcasty raději v Apple ekosystému.',
        href: AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
    },
] as const satisfies readonly AiTaKrajtaPlatform[];

/**
 * Every public profile that identifies the same podcast outside this site.
 */
export const AI_TA_KRAJTA_SOCIAL_URLS: readonly string[] = [
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
    AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
    AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
    AI_TA_KRAJTA_LINKEDIN_URL,
];

export type AiTaKrajtaEpisode = {
    readonly number: number;
    readonly title: string;
    readonly spotifyEpisodeId: string;
};

/**
 * The newest episodes selected for the front page.
 *
 * Keeping this short list here makes a refresh a small editorial update instead of a change scattered through the UI.
 * The full archive always remains available on every podcast platform above.
 */
export const AI_TA_KRAJTA_EPISODES: readonly AiTaKrajtaEpisode[] = [
    {
        number: 64,
        title: 'Čtyři AI lídři opouštějí Google. Co chystá Discovery Loop?',
        spotifyEpisodeId: '1BLz7TUNb4vepZ2zfBrilm',
    },
    {
        number: 63,
        title: 'Google přesouvá šéfa AI. Co to znamená pro Gemini?',
        spotifyEpisodeId: '27UEn4jZX8UYjnmNfxBbQu',
    },
    {
        number: 62,
        title: 'AI modely na ESP32, AI Act a praktický vibecoding',
        spotifyEpisodeId: '7oTvSfkYNIP5qPl2eBG1Xp',
    },
    {
        number: 61,
        title: 'AI agent zdivočel a napadl konkurenci! Průlom k AGI, nebo konec světa?',
        spotifyEpisodeId: '1XoOW6X4ELowq91T9LjsTf',
    },
    {
        number: 60,
        title: 'Konec jedné éry? Proč se AI vrací k terminálu a co umí čínská Kimi 3, 1. část',
        spotifyEpisodeId: '6d8YdCk2ouyKLsJssKdGWH',
    },
    {
        number: 58,
        title: 'PixelRAG, AI kyberútoky a proč budoucnost agentů stojí na knowledge base',
        spotifyEpisodeId: '4V6seyxdTLPdyZDfgUYOK8',
    },
];

const SPOTIFY_EPISODE_URL_PREFIX = 'https://open.spotify.com/episode/';
const SPOTIFY_EPISODE_EMBED_URL_PREFIX = 'https://open.spotify.com/embed/episode/';

/**
 * Builds the canonical Spotify address of one episode.
 */
export function createAiTaKrajtaSpotifyEpisodeUrl(spotifyEpisodeId: string): string {
    return `${SPOTIFY_EPISODE_URL_PREFIX}${spotifyEpisodeId}`;
}

/**
 * Builds the Spotify player address of one episode.
 */
export function createAiTaKrajtaSpotifyEpisodeEmbedUrl(spotifyEpisodeId: string): string {
    return `${SPOTIFY_EPISODE_EMBED_URL_PREFIX}${spotifyEpisodeId}?utm_source=generator`;
}

/**
 * People who rotate at the microphones. They are deliberately not assigned made-up titles or fixed order.
 */
export const AI_TA_KRAJTA_HOST_NAMES = [
    'Šimon Podhajský',
    'Patrik Braborec',
    'Pavol Hejný',
    'Jiří Jahn',
    'Petr Glaser',
    'Kateřina Fajmanová',
    'Jan Soubusta',
] as const;

export type AiTaKrajtaGuest = {
    readonly name: string;
    readonly context: string;
};

/**
 * A few recent guests give prospective guests a concrete picture of the conversations.
 */
export const AI_TA_KRAJTA_RECENT_GUESTS: readonly AiTaKrajtaGuest[] = [
    { name: 'Lukáš Caha', context: 'Youklid a střízlivý pohled na byznys mimo AI hype.' },
    { name: 'Richard Mládek', context: 'SuperTurtle, hlasové řízení agentů a práce s kódem.' },
    { name: 'Tomáš Koblížek', context: 'Dezinformace, kontext a odpovědnost lidí, kteří něco publikují.' },
];

export type AiTaKrajtaCollaborationKind = 'topic' | 'guest' | 'sponsorship' | 'other';

export type AiTaKrajtaCollaborationOption = {
    readonly id: AiTaKrajtaCollaborationKind;
    readonly label: string;
    readonly title: string;
    readonly description: string;
};

/**
 * All reasons to contact the editorial team. The cards and the form use this one list, so their wording never drifts.
 */
export const AI_TA_KRAJTA_COLLABORATION_OPTIONS: readonly AiTaKrajtaCollaborationOption[] = [
    {
        id: 'topic',
        label: 'Chci navrhnout téma',
        title: 'Téma pro další díl',
        description: 'Pošlete odkaz, otázku nebo věc, která vám v AI pořád vrtá hlavou.',
    },
    {
        id: 'guest',
        label: 'Chci přijít jako host',
        title: 'Host do studia',
        description: 'Hledáme zkušenost z praxe, ne desetiminutový reklamní pitch.',
    },
    {
        id: 'sponsorship',
        label: 'Zajímá mě partnerství',
        title: 'Partnerství pro firmy',
        description: 'Máte produkt, službu nebo téma, které posluchačům opravdu dává smysl? Pojďme to probrat narovinu.',
    },
    {
        id: 'other',
        label: 'Mám jiný nápad',
        title: 'Jiná spolupráce',
        description: 'Někdy vznikne dobrý díl právě z nápadu, který se nevejde do formuláře.',
    },
];

/**
 * Source name recorded alongside collaboration forms in the shared contacts inbox.
 */
export const AI_TA_KRAJTA_COLLABORATION_PLACE_NAME = 'AiTaKrajtaCollaboration';
