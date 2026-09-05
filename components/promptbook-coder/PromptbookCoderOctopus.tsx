'use client';

import {
    drawPromptbookCoderOctopus,
    PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS,
} from '@/components/promptbook-coder/promptbookCoderOctopusArt';
import { selectPromptbookCoderOctopusPose } from '@/components/promptbook-coder/promptbookCoderOctopusPose';
import { usePromptbookCoderOctopusSenses } from '@/components/promptbook-coder/usePromptbookCoderOctopusSenses';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

/**
 * The octopus of Promptbook coder, drawn as the one line of characters its terminal draws it in
 *
 * Note: It is written in `currentColor` and has no size of its own, so whoever places it decides both. Its width is
 *       held at the width of a frame, because a tentacle which grows must not push the badge around it wider.
 *
 * Note: A screen reader is told nothing about it. What the octopus is doing is a joke for the eyes, and the badge it
 *       sits in already says in words what the tool is and where it leads.
 *
 * @param isGreeting whether the visitor is pointing at the badge, which is when the octopus waves back
 * @param className colour and size the octopus is written at
 */
export function PromptbookCoderOctopus({
    isGreeting = false,
    className,
}: {
    readonly isGreeting?: boolean;
    readonly className?: string;
}) {
    const octopusElementRef = useRef<HTMLSpanElement>(null);
    const perception = usePromptbookCoderOctopusSenses(octopusElementRef);
    const pose = selectPromptbookCoderOctopusPose({ ...perception, isGreeting });

    return (
        <span
            ref={octopusElementRef}
            aria-hidden="true"
            style={{ width: `${PROMPTBOOK_CODER_OCTOPUS_WIDTH_IN_CHARACTERS}ch` }}
            className={cn('inline-block shrink-0 whitespace-pre font-mono text-[0.8125rem] leading-none', className)}
        >
            {drawPromptbookCoderOctopus(pose)}
        </span>
    );
}
