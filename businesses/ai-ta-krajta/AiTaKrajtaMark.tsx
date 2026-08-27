'use client';

import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { cn } from '@/lib/utils';
import { useId } from 'react';

/**
 * Compact version of the Krajta used as the page mark and inside its larger playful illustration.
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
                <linearGradient id={gradientId} x1="31" y1="28" x2="101" y2="104" gradientUnits="userSpaceOnUse">
                    <stop stopColor={AI_TA_KRAJTA_COLORS.CORAL} />
                    <stop offset="1" stopColor={AI_TA_KRAJTA_COLORS.VIOLET} />
                </linearGradient>
            </defs>

            <path
                d="M22.5 91.5C21.4 74.1 32.3 61.2 49.6 59.1C59.5 57.9 68.4 60.2 76.6 64.7C84.8 69.1 95.7 72.7 106.1 77.2C111.2 79.4 113.5 84.7 111.4 89.6C109.7 93.7 105.4 95.5 101.2 94L77.6 85.7C69.8 83 63.9 81.2 57.9 81.9C52.2 82.6 48.6 86.1 48.8 91.8C49 98.4 54.1 101.7 60.1 102.1C66.4 102.6 71.9 99.9 77.5 96.7C81.5 94.4 86.6 95.7 88.9 99.7C91.2 103.7 89.9 108.8 85.9 111.1C77.5 116 68.7 119.5 58.8 118.8C38.6 117.4 23.7 107.5 22.5 91.5Z"
                fill={`url(#${gradientId})`}
            />
            <path
                d="M59.2 74.4C61.8 64.5 63.5 52.7 62.9 40.9C62.2 26.3 68.3 16 80.5 12.6C91.2 9.6 101.8 15.7 104.8 26.4C107.8 37.1 101.7 47.7 91 50.7C88.8 51.3 86.7 51.6 84.4 51.4C84.8 60.2 83.7 68.8 81.6 77.3L59.2 74.4Z"
                fill={`url(#${gradientId})`}
            />
            <path d="M88.3 29.2C89.4 26.8 92.2 25.8 94.5 26.9C96.9 28 97.9 30.8 96.8 33.2C95.7 35.5 92.9 36.5 90.5 35.4C88.2 34.3 87.2 31.5 88.3 29.2Z" fill="#171d1a" />
            <path d="M76.6 19.5C80.8 16.1 86.3 14.7 91.6 15.8" stroke="white" strokeOpacity="0.36" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}
