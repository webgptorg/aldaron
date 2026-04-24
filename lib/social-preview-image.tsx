import { ImageResponse } from 'next/og';

type SocialPreviewStat = {
    label: string;
    value: string;
};

type SocialPreviewPalette = {
    backgroundStart: string;
    backgroundEnd: string;
    accent: string;
    accentSoft: string;
    frame: string;
    cardBackground: string;
    mutedText: string;
    chipBackground: string;
    chipBorder: string;
    sidePanelBackground: string;
    sidePanelBorder: string;
    sideLabel: string;
    statBackground: string;
    statBorder: string;
    orbPrimary: string;
    orbSecondary: string;
};

export type SocialPreviewImageOptions = {
    alt: string;
    audienceLabel: string;
    description: string;
    eyebrow: string;
    palette: SocialPreviewPalette;
    stats: readonly SocialPreviewStat[];
    title: string;
    urlLabel: string;
    bullets: readonly string[];
};

export const socialImageSize = {
    width: 1200,
    height: 630,
};

export const socialImageContentType = 'image/png' as const;

export function createSocialPreviewImage({
    audienceLabel,
    bullets,
    description,
    eyebrow,
    palette,
    stats,
    title,
    urlLabel,
}: SocialPreviewImageOptions) {
    return new ImageResponse(
        (
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

                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        padding: 28,
                    }}
                >
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
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                }}
                            >
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        borderRadius: 9999,
                                        background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                                    }}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        fontSize: 28,
                                        fontWeight: 700,
                                        letterSpacing: -0.5,
                                    }}
                                >
                                    Promptbook
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 18,
                                }}
                            >
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
                                        fontSize: 66,
                                        fontWeight: 800,
                                        lineHeight: 1.05,
                                        letterSpacing: -1.8,
                                    }}
                                >
                                    {title}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        maxWidth: 710,
                                        fontSize: 26,
                                        lineHeight: 1.35,
                                        color: palette.mutedText,
                                    }}
                                >
                                    {description}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 14,
                                }}
                            >
                                {bullets.map((bullet) => (
                                    <div
                                        key={bullet}
                                        style={{
                                            display: 'flex',
                                            borderRadius: 9999,
                                            border: `1px solid ${palette.chipBorder}`,
                                            background: palette.chipBackground,
                                            padding: '12px 18px',
                                            fontSize: 20,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {bullet}
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        borderRadius: 9999,
                                        border: `1px solid ${palette.frame}`,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '10px 16px',
                                        fontSize: 22,
                                        fontWeight: 600,
                                        color: 'rgba(255, 255, 255, 0.86)',
                                    }}
                                >
                                    {urlLabel}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                width: '32%',
                                height: '100%',
                                display: 'flex',
                            }}
                        >
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
                                        fontSize: 18,
                                        fontWeight: 700,
                                        letterSpacing: 2.5,
                                        textTransform: 'uppercase',
                                        color: palette.sideLabel,
                                    }}
                                >
                                    {audienceLabel}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 16,
                                        marginTop: 24,
                                    }}
                                >
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 8,
                                                borderRadius: 22,
                                                border: `1px solid ${palette.statBorder}`,
                                                background: palette.statBackground,
                                                padding: 18,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    letterSpacing: 1.4,
                                                    textTransform: 'uppercase',
                                                    color: palette.sideLabel,
                                                }}
                                            >
                                                {stat.label}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    fontSize: 30,
                                                    fontWeight: 700,
                                                    lineHeight: 1.15,
                                                }}
                                            >
                                                {stat.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'space-between',
                                        marginTop: 'auto',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                fontSize: 18,
                                                color: palette.sideLabel,
                                            }}
                                        >
                                            Share-ready preview
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                maxWidth: 210,
                                                fontSize: 22,
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {urlLabel}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            width: 82,
                                            height: 82,
                                            display: 'flex',
                                            borderRadius: 24,
                                            background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentSoft} 100%)`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        socialImageSize,
    );
}
