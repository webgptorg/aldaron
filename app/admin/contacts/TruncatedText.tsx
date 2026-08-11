'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { AnchorHTMLAttributes } from 'react';

/**
 * How the text is cut off by the ellipsis "..." for the supported line counts
 *
 * Note: The class names are written out so that Tailwind really generates them
 */
const LINE_COUNT_CLASS_NAMES: Readonly<Record<number, string>> = {
    1: 'truncate',
    2: 'line-clamp-2 whitespace-normal break-words',
    3: 'line-clamp-3 whitespace-normal break-words',
    4: 'line-clamp-4 whitespace-normal break-words',
};

const FALLBACK_LINE_COUNT_CLASS_NAME = LINE_COUNT_CLASS_NAMES[3];

type TruncatedTextLink = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'rel' | 'target'> & {
    readonly href: string;
};

type TruncatedTextProps = {
    readonly text: string;

    /**
     * How many lines are shown before the rest of the text is cut off by the ellipsis "..."
     */
    readonly lineCount: number;

    /**
     * Makes the text a link while preserving the truncation and the full-value tooltip
     */
    readonly link?: TruncatedTextLink;
};

/**
 * Text cut off by the ellipsis "..." which shows the whole value in a tooltip
 *
 * Note: Nothing here limits the width, so the text is cut exactly where the (resized) column ends
 */
export function TruncatedText(props: TruncatedTextProps) {
    const { text, lineCount, link } = props;

    if (text === '') {
        return null;
    }

    const lineCountClassName = LINE_COUNT_CLASS_NAMES[lineCount] || FALLBACK_LINE_COUNT_CLASS_NAME;
    const content =
        link === undefined ? (
            <div className={`cursor-help ${lineCountClassName}`}>{text}</div>
        ) : (
            <a
                href={link.href}
                target={link.target}
                rel={link.rel}
                className={`block text-primary underline underline-offset-2 hover:text-primary/80 ${lineCountClassName}`}
            >
                {text}
            </a>
        );

    return (
        <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent className="max-w-md whitespace-pre-wrap break-words">
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
