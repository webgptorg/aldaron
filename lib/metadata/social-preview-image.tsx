import type { SocialPreviewPalette } from '@/lib/metadata/social-preview-palette';
import { SocialPreviewArtwork, type SocialPreviewArtworkKind } from '@/lib/metadata/social-preview-artwork';
import { ImageResponse } from 'next/og';

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
     * Non-textual visual metaphor which makes the page identifiable in a feed
     */
    readonly artwork: SocialPreviewArtworkKind;

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
 * Renders the large color shapes behind the composition
 */
function SocialPreviewBackdrop({ palette }: { palette: SocialPreviewPalette }) {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: -160,
                    left: -130,
                    width: 460,
                    height: 460,
                    display: 'flex',
                    borderRadius: 9999,
                    background: palette.orbPrimary,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: -110,
                    bottom: -150,
                    width: 460,
                    height: 460,
                    display: 'flex',
                    borderRadius: 9999,
                    background: palette.orbSecondary,
                }}
            />
        </>
    );
}

/**
 * Renders the brand mark in the top left corner of the image
 */
function SocialPreviewBrand({ brandLabel, palette }: { brandLabel: string; palette: SocialPreviewPalette }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
                style={{
                    width: 30,
                    height: 30,
                    display: 'flex',
                    borderRadius: 9,
                    background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                    transform: 'rotate(12deg)',
                }}
            />
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>{brandLabel}</div>
        </div>
    );
}

/**
 * Selects a title size which stays generous while letting longer localized headlines breathe.
 */
function selectSocialPreviewTitleFontSize(title: string): number {
    if (title.length > 58) {
        return 46;
    }

    if (title.length > 42) {
        return 52;
    }

    return 60;
}

/**
 * Renders the small context label and the one message a visitor should notice.
 */
function SocialPreviewHeadline({ eyebrow, title, palette }: { eyebrow: string; title: string; palette: SocialPreviewPalette }) {
    const titleFontSize = selectSocialPreviewTitleFontSize(title);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div
                style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                    borderRadius: 999,
                    border: `1px solid ${palette.chipBorder}`,
                    background: `${palette.accent}16`,
                    padding: '10px 16px',
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 2.2,
                    textTransform: 'uppercase',
                    color: palette.accent,
                }}
            >
                {eyebrow}
            </div>
            <div
                style={{
                    display: 'flex',
                    maxWidth: 620,
                    fontSize: titleFontSize,
                    fontWeight: 800,
                    lineHeight: 1.04,
                    letterSpacing: -1.8,
                }}
            >
                {title}
            </div>
        </div>
    );
}

/**
 * Renders a small source line without asking a social card to repeat the page's entire sales copy.
 */
function SocialPreviewSourceLine({ palette }: { palette: SocialPreviewPalette }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: palette.mutedText,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 0.2,
            }}
        >
            <div
                style={{
                    width: 8,
                    height: 8,
                    display: 'flex',
                    borderRadius: 999,
                    background: palette.accent,
                }}
            />
            ptbk.io
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
        artwork,
        brandLabel,
        eyebrow,
        palette,
        title,
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
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: 'flex',
                    opacity: 0.16,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    overflow: 'hidden',
                    border: `1px solid ${palette.frame}`,
                }}
            >
                <div
                    style={{
                        width: '57%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '58px 0 52px 68px',
                    }}
                >
                    <SocialPreviewBrand brandLabel={brandLabel} palette={palette} />
                    <SocialPreviewHeadline eyebrow={eyebrow} title={title} palette={palette} />
                    <SocialPreviewSourceLine palette={palette} />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        right: -12,
                        bottom: 14,
                        width: 552,
                        height: 454,
                        display: 'flex',
                    }}
                >
                    <SocialPreviewArtwork kind={artwork} palette={palette} />
                </div>
            </div>
        </div>,
        SOCIAL_PREVIEW_IMAGE_SIZE,
    );
}
