import {
    PROMPTBOOK_CODER_MARK_ARM_PATH_DATA,
    PROMPTBOOK_CODER_MARK_EYES,
    PROMPTBOOK_CODER_MARK_HEAD_PATH_DATA,
    PROMPTBOOK_CODER_MARK_MOUTH_PATH_DATA,
    PROMPTBOOK_CODER_MARK_STROKE_WIDTH,
    PROMPTBOOK_CODER_MARK_VIEW_BOX_SIZE,
} from '@/components/promptbook-coder/promptbookCoderMarkArtwork';
import { cn } from '@/lib/utils';

/**
 * The octopus of Promptbook coder, drawn the way its terminal draws it in characters
 *
 * Note: It is drawn in `currentColor` and has no size of its own, so whoever places it decides both. The arms keep
 *       their mitred corners, because a rounded corner is what would turn the folded `_/\/\_` of the original back
 *       into an ordinary curly tentacle.
 *
 * @param className size and colour the octopus is drawn at
 */
export function PromptbookCoderMark({ className }: { readonly className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox={`0 0 ${PROMPTBOOK_CODER_MARK_VIEW_BOX_SIZE} ${PROMPTBOOK_CODER_MARK_VIEW_BOX_SIZE}`}
            fill="none"
            className={cn('block', className)}
            xmlns="http://www.w3.org/2000/svg"
        >
            {PROMPTBOOK_CODER_MARK_ARM_PATH_DATA.map((armPathData) => (
                <path
                    key={armPathData}
                    d={armPathData}
                    stroke="currentColor"
                    strokeWidth={PROMPTBOOK_CODER_MARK_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="miter"
                />
            ))}

            <path
                d={PROMPTBOOK_CODER_MARK_HEAD_PATH_DATA}
                stroke="currentColor"
                strokeWidth={PROMPTBOOK_CODER_MARK_STROKE_WIDTH}
                strokeLinejoin="round"
            />

            <path
                d={PROMPTBOOK_CODER_MARK_MOUTH_PATH_DATA}
                stroke="currentColor"
                strokeWidth={PROMPTBOOK_CODER_MARK_STROKE_WIDTH}
                strokeLinecap="round"
            />

            {PROMPTBOOK_CODER_MARK_EYES.map((eye) => (
                <circle key={eye.id} cx={eye.x} cy={eye.y} r={eye.radius} fill="currentColor" />
            ))}
        </svg>
    );
}
