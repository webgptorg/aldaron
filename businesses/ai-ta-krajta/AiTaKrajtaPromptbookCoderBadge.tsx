import {
    AI_TA_KRAJTA_PROMPTBOOK_CODER_BADGE_LABEL,
    AI_TA_KRAJTA_PROMPTBOOK_CODER_URL,
} from '@/businesses/ai-ta-krajta/config';
import { ArrowUpRight, Code2 } from 'lucide-react';

const PROMPTBOOK_CODER_BADGE_CLASS_NAME =
    'inline-flex items-center gap-1.5 rounded-full border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb0b0] transition-colors hover:border-[#ff6b6b]/60 hover:bg-[#ff6b6b]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b6b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141a16]';

/**
 * Credits the tool which built the podcast page and leads to its public page.
 */
export function AiTaKrajtaPromptbookCoderBadge() {
    return (
        <a
            href={AI_TA_KRAJTA_PROMPTBOOK_CODER_URL}
            target="_blank"
            rel="noreferrer"
            className={PROMPTBOOK_CODER_BADGE_CLASS_NAME}
        >
            <Code2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{AI_TA_KRAJTA_PROMPTBOOK_CODER_BADGE_LABEL}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
    );
}
