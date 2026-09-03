import { PromptbookCoderMark } from '@/components/promptbook-coder/PromptbookCoderMark';
import {
    PROMPTBOOK_CODER_BADGE_LABEL,
    PROMPTBOOK_CODER_URL,
} from '@/components/promptbook-coder/promptbookCoderConfig';
import { cn } from '@/lib/utils';

/**
 * Says that the page was written by Promptbook coder and leads to it
 *
 * Note: The classes it defaults to are the ones of a dark page, which is where it is worn today. A page of another
 *       colour passes its own through `className` and `markClassName` rather than getting a second badge.
 *
 * @param className look of the whole badge
 * @param markClassName size and colour of the octopus, which is the accent of Promptbook coder by default
 */
export function PromptbookCoderBadge({
    className,
    markClassName,
}: {
    readonly className?: string;
    readonly markClassName?: string;
}) {
    return (
        <a
            href={PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
                'group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2.5 pr-4 text-xs font-medium text-white/60 transition-colors hover:border-white/25 hover:bg-white/[0.07] hover:text-white',
                className,
            )}
        >
            <PromptbookCoderMark
                className={cn(
                    'h-5 w-5 shrink-0 text-promptbook-blue transition-transform duration-300 group-hover:-translate-y-0.5',
                    markClassName,
                )}
            />
            {PROMPTBOOK_CODER_BADGE_LABEL}
        </a>
    );
}
