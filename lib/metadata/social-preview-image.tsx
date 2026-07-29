import type { SocialPreviewPalette } from '@/lib/metadata/social-preview-palette';
import { ImageResponse } from 'next/og';

/**
 * Single fact highlighted in the side panel of a social preview image
 */
export type SocialPreviewStat = {
    readonly label: string;
    readonly value: string;
};

/**
 * Everything a social preview image needs to be rendered
 */
export type SocialPreviewImageOptions = {
    /**
     * Alternative text of the image
     */
    readonly alt: string;

    /**
     * Brand shown next to the logo dot
     */
    readonly brandLabel: string;

    /**
     * Small uppercase line above the headline
     */
    readonly eyebrow: string;

    /**
     * Headline of the card
     */
    readonly title: string;

    /**
     * Supporting sentence below the headline
     */
    readonly description: string;

    /**
     * Short selling points rendered as chips
     */
    readonly bullets: readonly string[];

    /**
     * Human readable url of the page
     */
    readonly urlLabel: string;

    /**
     * Audience the page is written for, shown above the stats
     */
    readonly audienceLabel: string;

    /**
     * Facts highlighted in the side panel
     */
    readonly stats: readonly SocialPreviewStat[];

    /**
     * Main call to action of the page, highlighted next to the url
     */
    readonly callToActionLabel: string;

    /**
     * Colors of the card
     */
    readonly palette: SocialPreviewPalette;
};

/**
 * Dimensions expected by Facebook, LinkedIn and X for a large sharing preview
 */
export const SOCIAL_PREVIEW_IMAGE_SIZE = {
    width: 1200,
    height: 630,
};

/**
 * Format the social preview images are served in
 */
export const SOCIAL_PREVIEW_IMAGE_CONTENT_TYPE = 'image/png' as const;

/**
 * Renders the two blurred orbs behind the card
 */
function SocialPreviewBackdrop({ palette }: { palette: SocialPreviewPalette }) {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: -120,
                    left: -120,
                    width: 360,
                    height: 360,
                    display: 'flex',
                    borderRadius: 9999,
                    background: palette.orbPrimary,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: -70,
                    bottom: -90,
                    width: 320,
                    height: 320,
                    display: 'flex',
                    borderRadius: 9999,
                    background: palette.orbSecondary,
                }}
            />
        </>
    );
}

/**
 * Renders the brand mark in the top left corner of the card
 */
function SocialPreviewBrand({ brandLabel, palette }: { brandLabel: string; palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
                style={{
                    width: 20,
                    height: 20,
                    display: 'flex',
                    borderRadius: 9999,
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                }}
            />
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{brandLabel}</div>
        </div>
    );
}

/**
 * Renders the eyebrow, headline and description of the card
 */
function SocialPreviewHeadline({
    eyebrow,
    title,
    description,
    palette,
}: {
    eyebrow: string;
    title: string;
    description: string;
    palette: SocialPreviewPalette;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
                style={{
                    display: 'flex',
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: palette.accent,
                }}
            >
                {eyebrow}
            </div>
            <div
                style={{
                    display: 'flex',
                    maxWidth: 690,
                    fontSize: 56,
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: -1.6,
                }}
            >
                {title}
            </div>
            <div style={{ display: 'flex', maxWidth: 690, fontSize: 22, lineHeight: 1.35, color: palette.mutedText }}>
                {description}
            </div>
        </div>
    );
}

/**
 * Renders the selling points of the page as chips
 */
function SocialPreviewBullets({ bullets, palette }: { bullets: readonly string[]; palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {bullets.map((bullet) => (
                <div
                    key={bullet}
                    style={{
                        display: 'flex',
                        borderRadius: 9999,
                        border: `1px solid ${palette.chipBorder}`,
                        background: palette.chipBackground,
                        padding: '10px 16px',
                        fontSize: 18,
                        fontWeight: 600,
                    }}
                >
                    {bullet}
                </div>
            ))}
        </div>
    );
}

/**
 * Renders the call to action next to the url of the page
 */
function SocialPreviewFooter({
    urlLabel,
    callToActionLabel,
    palette,
}: {
    urlLabel: string;
    callToActionLabel: string;
    palette: SocialPreviewPalette;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
                style={{
                    display: 'flex',
                    borderRadius: 9999,
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                    padding: '12px 22px',
                    fontSize: 20,
                    fontWeight: 700,
                    color: palette.backgroundStart,
                }}
            >
                {callToActionLabel}
            </div>
            <div
                style={{
                    display: 'flex',
                    borderRadius: 9999,
                    border: `1px solid ${palette.frame}`,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '11px 18px',
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.86)',
                }}
            >
                {urlLabel}
            </div>
        </div>
    );
}

/**
 * Renders a single highlighted fact of the side panel
 */
function SocialPreviewStatCard({ stat, palette }: { stat: SocialPreviewStat; palette: SocialPreviewPalette }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                borderRadius: 18,
                border: `1px solid ${palette.statBorder}`,
                background: palette.statBackground,
                padding: 16,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: palette.sideLabel,
                }}
            >
                {stat.label}
            </div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
        </div>
    );
}

/**
 * Renders the audience of the page together with the facts highlighted for it
 */
function SocialPreviewSidePanel({
    audienceLabel,
    stats,
    palette,
}: {
    audienceLabel: string;
    stats: readonly SocialPreviewStat[];
    palette: SocialPreviewPalette;
}) {
    return (
        <div style={{ width: '32%', height: '100%', display: 'flex' }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 28,
                    border: `1px solid ${palette.sidePanelBorder}`,
                    background: palette.sidePanelBackground,
                    padding: 28,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: 2.2,
                        textTransform: 'uppercase',
                        color: palette.sideLabel,
                    }}
                >
                    {audienceLabel}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                    {stats.map((stat) => (
                        <SocialPreviewStatCard key={stat.label} stat={stat} palette={palette} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Renders the sharing preview image of a page
 *
 * @param options content and colors of the card
 * @returns image response served by an `opengraph-image` route
 */
export function createSocialPreviewImage(options: SocialPreviewImageOptions) {
    const {
        audienceLabel,
        brandLabel,
        bullets,
        callToActionLabel,
        description,
        eyebrow,
        palette,
        stats,
        title,
        urlLabel,
    } = options;

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${palette.backgroundStart} 0%, ${palette.backgroundEnd} 100%)`,
                color: '#ffffff',
                fontFamily: 'Inter, Arial, sans-serif',
            }}
        >
            <SocialPreviewBackdrop palette={palette} />

            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', padding: 28 }}>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        borderRadius: 34,
                        border: `1px solid ${palette.frame}`,
                        background: palette.cardBackground,
                        padding: 36,
                    }}
                >
                    <div
                        style={{
                            width: '68%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingRight: 24,
                        }}
                    >
                        <SocialPreviewBrand brandLabel={brandLabel} palette={palette} />
                        <SocialPreviewHeadline
                            eyebrow={eyebrow}
                            title={title}
                            description={description}
                            palette={palette}
                        />
                        <SocialPreviewBullets bullets={bullets} palette={palette} />
                        <SocialPreviewFooter
                            urlLabel={urlLabel}
                            callToActionLabel={callToActionLabel}
                            palette={palette}
                        />
                    </div>

                    <SocialPreviewSidePanel audienceLabel={audienceLabel} stats={stats} palette={palette} />
                </div>
            </div>
        </div>,
        SOCIAL_PREVIEW_IMAGE_SIZE,
    );
}
