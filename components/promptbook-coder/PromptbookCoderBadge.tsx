'use client';

import { PromptbookCoderOctopus } from '@/components/promptbook-coder/PromptbookCoderOctopus';
import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Says that the page was written by Promptbook coder and leads to it
 *
 * Note: The classes it defaults to are the ones of a dark page, which is where it is worn today. A page of another
 *       colour passes its own through `className`, `octopusClassName` and `labelClassName` rather than getting a
 *       second badge.
 *
 * @param className look of the whole badge
 * @param octopusClassName size and colour of the octopus, which is the accent of Promptbook coder by default
 * @param labelClassName look of the words, which a badge with no room for them can fold away
 */
export function PromptbookCoderBadge({
    className,
    octopusClassName,
    labelClassName,
}: {
    readonly className?: string;
    readonly octopusClassName?: string;
    readonly labelClassName?: string;
}) {
    const [isGreeting, setIsGreeting] = useState(false);

    return (
        <a
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            // Note: The octopus greets whoever reaches the badge with the keyboard as well, so that the joke is not
            //       reserved for visitors who arrive with a mouse.
            onPointerEnter={() => setIsGreeting(true)}
            onPointerLeave={() => setIsGreeting(false)}
            onFocus={() => setIsGreeting(true)}
            onBlur={() => setIsGreeting(false)}
            className={cn(
                'group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2.5 pr-4 text-xs font-medium text-white/60 transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white',
                className,
            )}
        >
            <PromptbookCoderOctopus isGreeting={isGreeting} className={cn('text-promptbook-blue', octopusClassName)} />
            <span className={cn('whitespace-nowrap', labelClassName)}>{PROMPTBOOK_CODER_BADGE_LABEL}</span>
        </a>
    );
}
