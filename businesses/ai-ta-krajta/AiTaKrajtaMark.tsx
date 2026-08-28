'use client';

import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { cn } from '@/lib/utils';
import { useId } from 'react';

/**
 * The snake of the show, drawn the way the cover artwork draws it
 *
 * Note: It is a drawing rather than the cover image, so it can sit on any background, scale to a favicon and be the
 *       thing the game in the header uncoils from.
 */
export function AiTaKrajtaMark({ className }: { readonly className?: string }) {
    const gradientId = useId();

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 128 128"
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id={gradientId} x1="76" y1="24" x2="30" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor={AI_TA_KRAJTA_COLORS.CORAL} />
                    <stop offset="0.45" stopColor="#d1809f" />
                    <stop offset="1" stopColor={AI_TA_KRAJTA_COLORS.INDIGO} />
                </linearGradient>
            </defs>

            {/* The tail, which slides out to the right from under the coil */}
            <path d="M56 80L108 97L54 103Z" fill={AI_TA_KRAJTA_COLORS.CORAL} />

            {/* The coiled body */}
            <path
                d="M22 86C22 74 34 67 51 67C67 67 77 74 77 85C77 96 64 102 47 102C29 102 22 97 22 86Z"
                fill={`url(#${gradientId})`}
            />

            {/* The neck rising out of the coil and the head at the top of it */}
            <path
                d="M67 92C67 72 64 48 70 36"
                stroke={`url(#${gradientId})`}
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
            />
            <ellipse
                cx="71"
                cy="29"
                rx="15"
                ry="12.5"
                transform="rotate(-10 71 29)"
                fill={AI_TA_KRAJTA_COLORS.CORAL}
            />
        </svg>
    );
}
