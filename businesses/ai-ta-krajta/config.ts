import type { SupportedHomepageLanguage } from '@/lib/homepage-language';

/**
 * Public route of the podcast page
 */
export const AI_TA_KRAJTA_PATH = '/ai-ta-krajta';

/**
 * Name of the podcast, written the way the show writes it itself
 */
export const AI_TA_KRAJTA_NAME = 'AI ta Krajta';

/**
 * Name used in browser and sharing metadata, where the snake is part of the podcast identity
 */
export const AI_TA_KRAJTA_BRAND_NAME = `${AI_TA_KRAJTA_NAME} 🐍`;

/**
 * Cover artwork of the show, also used by Pavol Hejný's media list
 */
export const AI_TA_KRAJTA_COVER_IMAGE_PATH = '/pavol/media/ai-ta-krajta.jpg';

/**
 * The square podcast cover doubles as its favicon, touch icon and installed-app icon
 */
export const AI_TA_KRAJTA_APP_ICON = {
    path: AI_TA_KRAJTA_COVER_IMAGE_PATH,
    sizes: '900x900',
    type: 'image/jpeg',
} as const;

/**
 * Colors read off the cover artwork, so that the page, the mini player and the generated sharing image agree
 */
export const AI_TA_KRAJTA_COLORS = {
    /**
     * Dark green the cover artwork sits on
     */
    MOSS: '#303832',

    /**
     * Darker green used behind the moss one, for the footer and the mini player
     */
    MOSS_DEEP: '#1a201c',

    /**
     * Head of the snake
     */
    CORAL: '#ff6b6b',

    /**
     * Tail of the snake
     */
    INDIGO: '#6b8cff',

    /**
     * Warm off-white the artwork is placed on
     */
    PAPER: '#f6f4ee',
} as const;

/**
 * Browser chrome and installed-app background drawn from the dark cover artwork
 */
export const AI_TA_KRAJTA_THEME_COLOR = AI_TA_KRAJTA_COLORS.MOSS_DEEP;

/**
 * One sentence describing the show, taken from the podcast feed
 */
export const AI_TA_KRAJTA_TAGLINE_BY_LANGUAGE: Readonly<Record<SupportedHomepageLanguage, string>> = {
    cs: 'Vše o AI na jednom místě, každý týden. Novinky, zajímavosti a diskuze z oblasti umělé inteligence.',
    en: 'Everything about AI in one place, every week. News, interesting finds and discussions about artificial intelligence.',
};

export const AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@aitakrajta_tv';
export const AI_TA_KRAJTA_SPOTIFY_SHOW_URL = 'https://open.spotify.com/show/31vLTHTV4vlCBeHpnbMKlK';
export const AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL = 'https://podcasts.apple.com/cz/podcast/ai-ta-krajta/id1813389353';
export const AI_TA_KRAJTA_LINKEDIN_URL = 'https://www.linkedin.com/company/aitakrajta';
export const AI_TA_KRAJTA_INSTAGRAM_URL = 'https://www.instagram.com/aitakrajta_tv/';

const AI_TA_KRAJTA_X_USERNAME = 'aitakrajta_tv';

export const AI_TA_KRAJTA_X_HANDLE = `@${AI_TA_KRAJTA_X_USERNAME}`;
export const AI_TA_KRAJTA_X_URL = `https://x.com/${AI_TA_KRAJTA_X_USERNAME}`;

/**
 * Route at which Next.js serves the podcast's installable web-app manifest
 */
export const AI_TA_KRAJTA_MANIFEST_PATH = `${AI_TA_KRAJTA_PATH}/manifest.webmanifest`;

/**
 * Feed which every episode of the show comes from
 */
export const AI_TA_KRAJTA_RSS_FEED_URL = 'https://anchor.fm/s/104a797ac/podcast/rss';

/**
 * Where an episode description stops describing the episode and starts listing links, sponsors and chapters
 *
 * Note: These are the headings the editors of this one show type into every description.
 */
export const AI_TA_KRAJTA_SUMMARY_STOP_PHRASES: readonly string[] = [
    'Děkujeme sponzorům',
    'Sítě, kde nás můžete sledovat',
    'Hosté:',
    'Kapitoly:',
    'Zmíněné zdroje',
    'Odkazy z epizody',
    'Odkazy zmíněné',
    'Přináší vám',
    'Odkaz na naše',
    'Náš workshop zdarma',
    'Témata v tomto díle',
];

export type AiTaKrajtaPlatformId = 'youtube' | 'spotify' | 'applePodcasts' | 'linkedin';

export type AiTaKrajtaPlatform = {
    readonly id: AiTaKrajtaPlatformId;
    readonly label: string;

    /**
     * What a listener gets exactly here and nowhere else
     */
    readonly description: string;
    readonly url: string;
};

/**
 * Every place the same show is published, in the order the page offers them
 */
export const AI_TA_KRAJTA_PLATFORMS: readonly AiTaKrajtaPlatform[] = [
    {
        id: 'youtube',
        label: 'YouTube',
        description: 'Video, komentáře, celý archiv',
        url: AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
    },
    {
        id: 'spotify',
        label: 'Spotify',
        description: 'Do sluchátek cestou do práce',
        url: AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
    },
    {
        id: 'applePodcasts',
        label: 'Apple Podcasts',
        description: 'Když máte podcasty v Applu',
        url: AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        description: 'Střípky z dílů a debata pod nimi',
        url: AI_TA_KRAJTA_LINKEDIN_URL,
    },
];

/**
 * Every public profile which is the same show, published as `sameAs` so search engines connect them
 */
export const AI_TA_KRAJTA_SOCIAL_URLS: readonly string[] = [
    AI_TA_KRAJTA_YOUTUBE_CHANNEL_URL,
    AI_TA_KRAJTA_SPOTIFY_SHOW_URL,
    AI_TA_KRAJTA_APPLE_PODCASTS_SHOW_URL,
    AI_TA_KRAJTA_LINKEDIN_URL,
    AI_TA_KRAJTA_INSTAGRAM_URL,
    AI_TA_KRAJTA_X_URL,
];

/**
 * Anchors of the sections of the page, which the header navigates between and which links from outside can point at
 */
export const AI_TA_KRAJTA_SECTION_IDS = {
    EPISODES: 'dily',
    PEOPLE: 'lidi',
    COLLABORATION: 'spoluprace',
} as const;

export type AiTaKrajtaNavigationItem = {
    readonly label: string;
    readonly href: string;
};

/**
 * Navigation of the header, which walks the page from the episodes down to the collaboration
 */
export const AI_TA_KRAJTA_NAVIGATION_ITEMS: readonly AiTaKrajtaNavigationItem[] = [
    { label: 'Díly', href: `#${AI_TA_KRAJTA_SECTION_IDS.EPISODES}` },
    { label: 'Kdo v tom jede', href: `#${AI_TA_KRAJTA_SECTION_IDS.PEOPLE}` },
    { label: 'Spolupráce', href: `#${AI_TA_KRAJTA_SECTION_IDS.COLLABORATION}` },
];

/**
 * How many episodes the archive shows before a visitor asks for the rest
 */
export const AI_TA_KRAJTA_INITIAL_EPISODE_COUNT = 12;

export type AiTaKrajtaCollaborationKind = 'host' | 'tema' | 'partnerstvi' | 'jine';

export type AiTaKrajtaCollaborationOption = {
    readonly id: AiTaKrajtaCollaborationKind;

    /**
     * Wording of the choice in the form
     */
    readonly label: string;

    /**
     * Heading of the card which explains this kind of collaboration
     */
    readonly title: string;

    /**
     * What the visitor should send and what happens with it
     */
    readonly description: string;
};

/**
 * Every reason to write to the show. The cards above the form and the form itself read from this one list, so the two
 * can never offer different options.
 */
export const AI_TA_KRAJTA_COLLABORATION_OPTIONS: readonly AiTaKrajtaCollaborationOption[] = [
    {
        id: 'host',
        label: 'Chci k vám přijít jako host',
        title: 'Přijít do studia',
        description:
            'Nejlepší díly vznikly s lidmi, kteří něco postavili a umí o tom mluvit i tehdy, když se to nepovedlo. Napište, na čem děláte a co vás na tom štve. Reklamní pitch odmítneme, i kdyby byl sebehezčí.',
    },
    {
        id: 'tema',
        label: 'Mám tip na téma',
        title: 'Poslat téma',
        description:
            'Paper, který nikdo nečetl. Regulace, které nikdo nerozumí. Nástroj, co vám změnil týden. Stačí odkaz a jedna věta, proč to stojí za třicet minut debaty.',
    },
    {
        id: 'partnerstvi',
        label: 'Zajímá mě partnerství',
        title: 'Partnerství pro firmy',
        description:
            'Posluchači jsou vývojáři, produkťáci a lidé, kteří o AI ve firmě rozhodují. Když má váš produkt smysl právě pro ně, ozvěte se. Rozsah a cenu pošleme v první odpovědi, žádné dohadování přes tři schůzky.',
    },
    {
        id: 'jine',
        label: 'Něco jiného',
        title: 'Něco jiného',
        description:
            'Společný díl, záznam z konference, spolupráce s komunitou. Když to nesedí do žádné škatulky výše, napište to natvrdo.',
    },
];

export type AiTaKrajtaSponsorshipPackage = {
    readonly id: string;
    readonly title: string;

    /**
     * What the partner gets, written so that it can be checked off after the recording
     */
    readonly deliverables: readonly string[];

    /**
     * Price in Czech crowns without VAT
     *
     * Note: `null` means that the price is not published yet and the page offers to send it instead of inventing a
     *       number. Fill it in and the exact price appears on the page, which is the whole point of this section.
     */
    readonly priceInCzechCrowns: number | null;
};

/**
 * What a company can buy, listed so that a partner knows what they get before they write the first e-mail
 */
export const AI_TA_KRAJTA_SPONSORSHIP_PACKAGES: readonly AiTaKrajtaSponsorshipPackage[] = [
    {
        id: 'zminka',
        title: 'Zmínka v dílu',
        deliverables: [
            'Přečtená zmínka na začátku a na konci dílu',
            'Odkaz v popisu na YouTube, Spotify i Apple Podcasts',
            'Logo v závěrečné grafice',
        ],
        priceInCzechCrowns: null,
    },
    {
        id: 'partner-dilu',
        title: 'Partner dílu',
        deliverables: [
            'Vše ze zmínky v dílu',
            'Dvouminutový blok o produktu na začátku',
            'Samostatný příspěvek na LinkedInu k vydání dílu',
            'Sestřih z dílu k vlastnímu použití',
        ],
        priceInCzechCrowns: null,
    },
    {
        id: 'sezona',
        title: 'Partner sezóny',
        deliverables: [
            'Partner dílu u série dílů po sobě',
            'Logo v úvodní znělce po celou dobu',
            'Jeden díl na téma, kterému vaši lidé rozumí',
            'Přehled poslechovosti po skončení sezóny',
        ],
        priceInCzechCrowns: null,
    },
];

/**
 * Name under which requests from this page arrive in the shared contacts inbox at `/admin/contacts`
 */
export const AI_TA_KRAJTA_COLLABORATION_PLACE_NAME = 'AiTaKrajtaSpoluprace';
