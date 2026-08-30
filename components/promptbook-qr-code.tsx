'use client';

import dynamic from 'next/dynamic';

type PromptbookQrCodeProps = {
    readonly value: string | number;
    readonly size?: number;
    readonly className?: string;
};

const DEFAULT_QR_CODE_SIZE = 250;
const QR_CODE_CANVAS_CONTAINER_CLASS_NAME = 'h-full w-full [&_canvas]:block';

/**
 * The branded QR renderer used wherever a Promptbook URL needs to move from a desktop screen to a phone.
 *
 * It stays client-only because the underlying canvas is drawn in the browser. Keeping that boundary here lets the
 * shortener and participant rooms use exactly the same QR-code implementation and canvas layout.
 */
const DynamicPromptbookQrCode = dynamic<PromptbookQrCodeProps>(
    () => import('@promptbook/components').then((module) => module.PromptbookQrCode),
    {
        ssr: false,
    },
);

/**
 * Renders a branded QR code at its requested square dimensions.
 *
 * The underlying renderer already includes the white quiet zone required for scanning. This wrapper makes the
 * canvas a block, so browser text-baseline spacing cannot make that zone look uneven.
 */
export function PromptbookQrCode({ value, size = DEFAULT_QR_CODE_SIZE, className }: PromptbookQrCodeProps) {
    return (
        <div className={className} style={{ height: size, width: size }}>
            <DynamicPromptbookQrCode
                value={value}
                size={size}
                className={QR_CODE_CANVAS_CONTAINER_CLASS_NAME}
            />
        </div>
    );
}
