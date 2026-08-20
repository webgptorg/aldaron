import type { WorkshopReactionAnimationDefinition } from '@/lib/workshops/workshopReactionAnimations';
import type { CSSProperties } from 'react';

/**
 * The few numbers which tell one flight of a reaction from another one
 *
 * Note: The stylesheet owns the shape of every flight and reads these numbers as custom properties, so the same
 *       keyframes serve every reaction and the browser still never draws two identical paths next to each other.
 */
export type WorkshopReactionStyle = CSSProperties & Record<`--${string}`, string>;

const HORIZONTAL_MINIMUM_PERCENT = 6;

/**
 * How far to the right a reaction may start
 *
 * Note: The reaction still drifts aside while it flies, so the last fifth of the stage is left to that drift and even
 *       the narrowest phone shows the whole emoji instead of a half of it.
 */
const HORIZONTAL_MAXIMUM_PERCENT = 80;

/**
 * Where a text reaction may start
 *
 * Note: A chip of up to `MAXIMAL_WORKSHOP_REACTION_LENGTH` characters is much wider than an emoji, so it starts closer
 *       to the middle and stays readable instead of being cut off by the edge of the stage.
 */
const HORIZONTAL_TEXT_MAXIMUM_PERCENT = 52;

const MINIMAL_RISE_PIXELS = -260;
const MAXIMAL_RISE_PIXELS = -170;
const MINIMAL_DRIFT_PIXELS = -34;
const MAXIMAL_DRIFT_PIXELS = 34;
const MINIMAL_SPIN_DEGREES = -14;
const MAXIMAL_SPIN_DEGREES = 14;
const MINIMAL_SCALE_JITTER = 0.88;
const MAXIMAL_SCALE_JITTER = 1.16;
const MINIMAL_DECORATION_DRIFT_PIXELS = 18;
const MAXIMAL_DECORATION_DRIFT_PIXELS = 62;
const MINIMAL_DECORATION_RISE_PIXELS = -96;
const MAXIMAL_DECORATION_RISE_PIXELS = -26;

const HORIZONTAL_VARIANT_INDEX = 0;
const RISE_VARIANT_INDEX = 1;
const DRIFT_VARIANT_INDEX = 2;
const SPIN_VARIANT_INDEX = 3;
const SCALE_VARIANT_INDEX = 4;

/**
 * Where the variants of the decorations start, so that a decoration never repeats a number of the reaction itself
 */
const DECORATION_VARIANT_INDEX_OFFSET = 16;
const DECORATION_VARIANT_COUNT = 2;

const FNV_OFFSET_BASIS = 2_166_136_261;
const FNV_PRIME = 16_777_619;
const VARIANT_MIXING_PRIME = 2_654_435_761;
const RATIO_MIXING_PRIME = 2_246_822_519;
const UNSIGNED_INTEGER_COUNT = 4_294_967_296;
const SCALE_DECIMAL_COUNT = 2;

/**
 * Turns the identity of a flight into a number, so that the very same reaction always takes the very same path
 */
function hashWorkshopReactionFlightId(flightId: string): number {
    let hash = FNV_OFFSET_BASIS;
    for (let characterIndex = 0; characterIndex < flightId.length; characterIndex++) {
        hash = Math.imul(hash ^ flightId.charCodeAt(characterIndex), FNV_PRIME);
    }
    return hash >>> 0;
}

/**
 * One of the many numbers hidden in a single hash, as a ratio between zero and one
 */
function pickSeededRatio(hash: number, variantIndex: number): number {
    const mixedHash = Math.imul(hash ^ Math.imul(variantIndex + 1, VARIANT_MIXING_PRIME), RATIO_MIXING_PRIME);
    return ((mixedHash ^ (mixedHash >>> 15)) >>> 0) / UNSIGNED_INTEGER_COUNT;
}

function pickSeededNumber(hash: number, variantIndex: number, minimum: number, maximum: number): number {
    return minimum + pickSeededRatio(hash, variantIndex) * (maximum - minimum);
}

/**
 * Where on the stage this reaction starts its flight, as a percentage of the width of the stage
 */
function pickHorizontalPositionPercent(hash: number, definition: WorkshopReactionAnimationDefinition): number {
    const maximumPercent =
        definition.appearance === 'code' ? HORIZONTAL_TEXT_MAXIMUM_PERCENT : HORIZONTAL_MAXIMUM_PERCENT;
    return Math.round(pickSeededNumber(hash, HORIZONTAL_VARIANT_INDEX, HORIZONTAL_MINIMUM_PERCENT, maximumPercent));
}

/**
 * Everything one flying reaction needs beyond its class names
 */
export function createWorkshopReactionStyle(
    flightId: string,
    definition: WorkshopReactionAnimationDefinition,
): WorkshopReactionStyle {
    const hash = hashWorkshopReactionFlightId(flightId);
    const scaleJitter = pickSeededNumber(hash, SCALE_VARIANT_INDEX, MINIMAL_SCALE_JITTER, MAXIMAL_SCALE_JITTER);

    return {
        left: `${pickHorizontalPositionPercent(hash, definition)}%`,
        '--workshop-reaction-duration': `${definition.durationMilliseconds}ms`,
        '--workshop-reaction-rise': `${Math.round(
            pickSeededNumber(hash, RISE_VARIANT_INDEX, MINIMAL_RISE_PIXELS, MAXIMAL_RISE_PIXELS),
        )}px`,
        '--workshop-reaction-drift': `${Math.round(
            pickSeededNumber(hash, DRIFT_VARIANT_INDEX, MINIMAL_DRIFT_PIXELS, MAXIMAL_DRIFT_PIXELS),
        )}px`,
        '--workshop-reaction-spin': `${Math.round(
            pickSeededNumber(hash, SPIN_VARIANT_INDEX, MINIMAL_SPIN_DEGREES, MAXIMAL_SPIN_DEGREES),
        )}deg`,
        '--workshop-reaction-scale': (definition.scale * scaleJitter).toFixed(SCALE_DECIMAL_COUNT),
    };
}

/**
 * Where one decorating character of a reaction flies
 *
 * Note: The decorations of a single reaction fan out to both sides, so a party popper throws its confetti apart
 *       instead of sending it all the very same way.
 */
export function createWorkshopReactionDecorationStyle(
    flightId: string,
    decorationIndex: number,
): WorkshopReactionStyle {
    const hash = hashWorkshopReactionFlightId(flightId);
    const driftVariantIndex = DECORATION_VARIANT_INDEX_OFFSET + decorationIndex * DECORATION_VARIANT_COUNT;
    const driftDirection = decorationIndex % 2 === 0 ? 1 : -1;
    const driftPixels =
        driftDirection *
        pickSeededNumber(hash, driftVariantIndex, MINIMAL_DECORATION_DRIFT_PIXELS, MAXIMAL_DECORATION_DRIFT_PIXELS);

    return {
        '--workshop-reaction-decoration-drift': `${Math.round(driftPixels)}px`,
        '--workshop-reaction-decoration-rise': `${Math.round(
            pickSeededNumber(
                hash,
                driftVariantIndex + 1,
                MINIMAL_DECORATION_RISE_PIXELS,
                MAXIMAL_DECORATION_RISE_PIXELS,
            ),
        )}px`,
    };
}
