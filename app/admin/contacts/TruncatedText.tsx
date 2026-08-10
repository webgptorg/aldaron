'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

type TruncatedTextProps = {
    readonly text: string;

    /**
     * How many lines are shown before the rest of the text is cut off by the ellipsis "..."
     */
    readonly lineCount: number;
};

/**
 * Text cut off by the ellipsis "..." which shows the whole value in a tooltip
 *
 * Note: Nothing here limits the width, so the text is cut exactly where the (resized) column ends
 */
export function TruncatedText(props: TruncatedTextProps) {
    const { text, lineCount } = props;

    if (text === '') {
        return null;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={`cursor-help ${LINE_COUNT_CLASS_NAMES[lineCount] || FALLBACK_LINE_COUNT_CLASS_NAME}`}>
                    {text}
                </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md whitespace-pre-wrap break-words">
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
