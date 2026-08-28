'use client';

import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { AI_TA_KRAJTA_COLORS } from '@/businesses/ai-ta-krajta/config';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * How large an avatar is drawn, in pixels
 */
const AVATAR_SIZE_IN_PIXELS = {
    small: 34,
    large: 96,
} as const;

export type AiTaKrajtaAvatarSize = keyof typeof AVATAR_SIZE_IN_PIXELS;

/**
 * The two letters standing in for a photograph nobody has taken yet
 */
function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((namePart) => namePart.charAt(0).toUpperCase())
        .join('');
}

/**
 * Turns the name into a stable angle of the gradient, so that two people next to each other never look identical
 */
function getGradientAngleInDegrees(name: string): number {
    const nameCode = Array.from(name).reduce((code, letter) => code + letter.charCodeAt(0), 0);

    return nameCode % 360;
}

/**
 * Round portrait of one person, shown next to an episode and on their card
 *
 * Note: Most people of the show have no portrait, so the initials on a branded gradient are the normal case rather
 *       than a fallback which looks broken.
 */
export function AiTaKrajtaPersonAvatar({
    person,
    size = 'small',
    className,
}: {
    readonly person: AiTaKrajtaPerson;
    readonly size?: AiTaKrajtaAvatarSize;
    readonly className?: string;
}) {
    const sizeInPixels = AVATAR_SIZE_IN_PIXELS[size];
    const isLarge = size === 'large';

    return (
        <span
            className={cn(
                'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                isLarge ? 'text-2xl font-semibold' : 'text-[11px] font-bold',
                className,
            )}
            style={{
                width: sizeInPixels,
                height: sizeInPixels,
                background: `linear-gradient(${getGradientAngleInDegrees(person.name)}deg, ${AI_TA_KRAJTA_COLORS.CORAL}, ${AI_TA_KRAJTA_COLORS.INDIGO})`,
            }}
        >
            {person.photoPath === null ? (
                <span className="text-white drop-shadow-sm">{getInitials(person.name)}</span>
            ) : (
                <Image
                    src={person.photoPath}
                    alt={person.name}
                    width={sizeInPixels}
                    height={sizeInPixels}
                    className="h-full w-full object-cover object-top"
                />
            )}
        </span>
    );
}
