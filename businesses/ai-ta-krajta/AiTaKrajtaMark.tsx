import {
    AI_TA_KRAJTA_MARK_BODY_SLICES,
    AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaMarkArtwork';
import { AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP } from '@/businesses/ai-ta-krajta/aiTaKrajtaSnakeBody';
import { cn } from '@/lib/utils';

/**
 * The snake of the show, drawn the way the cover artwork draws it
 *
 * Note: It is a drawing rather than the cover image, so it can sit on any background, scale to a favicon and be the
 *       thing the game in the header uncoils from.
 */
export function AiTaKrajtaMark({ className }: { readonly className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox={`0 0 ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE} ${AI_TA_KRAJTA_MARK_VIEW_BOX_SIZE}`}
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            {AI_TA_KRAJTA_MARK_BODY_SLICES.map((slice) => (
                <path
                    key={slice.id}
                    d={slice.pathData}
                    stroke={slice.color}
                    strokeWidth={slice.strokeWidth}
                    strokeLinecap={AI_TA_KRAJTA_SNAKE_BODY_LINE_CAP}
                    fill="none"
                />
            ))}
        </svg>
    );
}
