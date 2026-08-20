/**
 * One reaction on its way over the stage of a workshop room
 */
export type FlyingWorkshopReaction = {
    /**
     * What tells this single flight from every other one
     *
     * Note: The whole path of a reaction is derived from this identity, so the very same flight always looks the same,
     *       a re-render never restarts it in another place, and the server needs to send nothing about the animation.
     */
    readonly flightId: string;

    /**
     * What the participant sent, an emoji or any other short text
     */
    readonly reactionText: string;
};

/**
 * The paths a reaction can take over the stage
 *
 * Note: A flight owns the whole journey: how high, how far aside and in what rhythm the reaction travels. Every flight
 *       is drawn by one CSS keyframe animation of the very same name, so the browser animates it on the compositor and
 *       a full stage costs no JavaScript at all.
 */
export const WORKSHOP_REACTION_FLIGHTS = [
    'float',
    'bob',
    'sway',
    'drift',
    'roll',
    'hover',
    'updraft',
    'flutter',
    'slither',
    'launch',
    'stagger',
    'calm',
] as const;

export type WorkshopReactionFlight = (typeof WORKSHOP_REACTION_FLIGHTS)[number];

/**
 * What a reaction does with itself while it travels
 *
 * Note: A flourish is animated on the reaction alone, so it composes with any flight and both vocabularies can grow
 *       without touching each other.
 */
export const WORKSHOP_REACTION_FLOURISHES = [
    'swell',
    'pump',
    'heartbeat',
    'clap',
    'flicker',
    'blink',
    'tumble',
    'twinkle',
    'wriggle',
    'dart',
    'burst',
    'explode',
    'glitch',
    'keyboard',
] as const;

export type WorkshopReactionFlourish = (typeof WORKSHOP_REACTION_FLOURISHES)[number];

/**
 * The ways the few decorations of a reaction fly alongside it
 */
export const WORKSHOP_REACTION_DECORATION_MOTIONS = ['scatter', 'spark', 'caret'] as const;

export type WorkshopReactionDecorationMotion = (typeof WORKSHOP_REACTION_DECORATION_MOTIONS)[number];

/**
 * How the reaction itself is drawn
 *
 * Note: An emoji carries itself, while a text reaction such as `</>` needs a readable size and a monospace chip, so
 *       that a whole word does not cover the stream.
 */
export const WORKSHOP_REACTION_APPEARANCES = ['emoji', 'code'] as const;

export type WorkshopReactionAppearance = (typeof WORKSHOP_REACTION_APPEARANCES)[number];

/**
 * The handful of characters which fly alongside a reaction, such as the confetti of a party popper
 *
 * Note: The whole decoration is drawn by at most `MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT` elements, because a full
 *       stage would otherwise animate hundreds of them on a phone which has nothing to spare.
 */
export type WorkshopReactionDecoration = {
    readonly text: string;
    readonly count: number;
    readonly motion: WorkshopReactionDecorationMotion;
};

/**
 * How one kind of reaction is celebrated on the stage
 */
export type WorkshopReactionAnimationDefinition = {
    readonly key: string;

    /**
     * How the administration calls this animation while previewing the reactions of a workshop
     */
    readonly adminLabel: string;

    /**
     * The reactions which are celebrated this way, already in the form participants send them
     */
    readonly reactions: readonly string[];
    readonly flight: WorkshopReactionFlight;

    /**
     * What the reaction does while it flies, or `null` when it just travels
     */
    readonly flourish: WorkshopReactionFlourish | null;
    readonly decoration: WorkshopReactionDecoration | null;
    readonly appearance: WorkshopReactionAppearance;

    /**
     * How long the whole flight takes, which is also how long the room keeps the reaction on the stage
     */
    readonly durationMilliseconds: number;

    /**
     * How big this reaction is compared to a usual one
     */
    readonly scale: number;
};

export const MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT = 3;

const GENERIC_WORKSHOP_REACTION_ANIMATION_DURATION_MILLISECONDS = 2_600;
const CALM_WORKSHOP_REACTION_ANIMATION_DURATION_MILLISECONDS = 1_200;

/**
 * Every reaction which is celebrated its own way, in the order the administration offers them
 *
 * Note: This is the one place a reaction animation is registered. The room, the administration preview and the CSS
 *       vocabulary all read this registry, so a new reaction is one entry here plus the keyframes it asks for, and a
 *       reaction which is not registered still flies with the generic animation.
 */
export const WORKSHOP_REACTION_ANIMATION_DEFINITIONS = [
    {
        key: 'thumbs-up',
        adminLabel: 'Souhlas',
        reactions: ['👍'],
        flight: 'bob',
        flourish: 'pump',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_400,
        scale: 1,
    },
    {
        key: 'heart',
        adminLabel: 'Srdce',
        reactions: ['❤️', '💖', '🧡', '💙'],
        flight: 'sway',
        flourish: 'heartbeat',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_900,
        scale: 1.05,
    },
    {
        key: 'applause',
        adminLabel: 'Potlesk',
        reactions: ['👏'],
        flight: 'hover',
        flourish: 'clap',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_000,
        scale: 1,
    },
    {
        key: 'fire',
        adminLabel: 'Oheň',
        reactions: ['🔥'],
        flight: 'updraft',
        flourish: 'flicker',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_500,
        scale: 1.1,
    },
    {
        key: 'idea',
        adminLabel: 'Nápad',
        reactions: ['💡'],
        flight: 'drift',
        flourish: 'blink',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 3_000,
        scale: 1.05,
    },
    {
        key: 'laughter',
        adminLabel: 'Smích',
        reactions: ['😂', '🤣'],
        flight: 'roll',
        flourish: 'tumble',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_600,
        scale: 1,
    },
    {
        key: 'code',
        adminLabel: 'Kód',
        reactions: ['</>'],
        flight: 'stagger',
        flourish: 'glitch',
        decoration: { text: '▌', count: 1, motion: 'caret' },
        appearance: 'code',
        durationMilliseconds: 2_700,
        scale: 1,
    },
    {
        key: 'sparkles',
        adminLabel: 'Jiskry',
        reactions: ['✨'],
        flight: 'flutter',
        flourish: 'twinkle',
        decoration: { text: '✧', count: 2, motion: 'spark' },
        appearance: 'emoji',
        durationMilliseconds: 2_700,
        scale: 0.95,
    },
    {
        key: 'snake',
        adminLabel: 'Had',
        reactions: ['🐍'],
        flight: 'slither',
        flourish: 'wriggle',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 3_200,
        scale: 1.05,
    },
    {
        key: 'eyes',
        adminLabel: 'Sleduji',
        reactions: ['👀'],
        flight: 'hover',
        flourish: 'dart',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_300,
        scale: 1,
    },
    {
        key: 'party',
        adminLabel: 'Oslava',
        reactions: ['🎉'],
        flight: 'launch',
        flourish: 'burst',
        decoration: { text: '🎊', count: 3, motion: 'scatter' },
        appearance: 'emoji',
        durationMilliseconds: 2_800,
        scale: 1.15,
    },
    {
        key: 'fireworks',
        adminLabel: 'Ohňostroj',
        reactions: ['🎆'],
        flight: 'launch',
        flourish: 'explode',
        decoration: { text: '✦', count: 3, motion: 'spark' },
        appearance: 'emoji',
        durationMilliseconds: 3_100,
        scale: 1.2,
    },
    {
        key: 'developer',
        adminLabel: 'Vývojářka',
        reactions: ['👩‍💻', '👨‍💻', '🧑‍💻'],
        flight: 'stagger',
        flourish: 'keyboard',
        decoration: null,
        appearance: 'emoji',
        durationMilliseconds: 2_600,
        scale: 1.05,
    },
] as const satisfies readonly WorkshopReactionAnimationDefinition[];

/**
 * How an emoji nobody registered flies, which is the animation the room had before any reaction got its own one
 */
export const GENERIC_WORKSHOP_REACTION_ANIMATION: WorkshopReactionAnimationDefinition = {
    key: 'generic',
    adminLabel: 'Obecná animace',
    reactions: [],
    flight: 'float',
    flourish: 'swell',
    decoration: null,
    appearance: 'emoji',
    durationMilliseconds: GENERIC_WORKSHOP_REACTION_ANIMATION_DURATION_MILLISECONDS,
    scale: 1,
};

/**
 * How a reaction which is not an emoji at all flies
 *
 * Note: It takes the very same path as any other unregistered reaction and differs only in being readable, so an
 *       arbitrary word an admin sends into the room never covers the stream.
 */
export const GENERIC_WORKSHOP_TEXT_REACTION_ANIMATION: WorkshopReactionAnimationDefinition = {
    ...GENERIC_WORKSHOP_REACTION_ANIMATION,
    key: 'generic-text',
    adminLabel: 'Obecná animace textu',
    appearance: 'code',
};

/*
 * Note: These patterns are built instead of being written down as literals, because the project is compiled for a
 *       target which does not know the unicode flag of a regular expression literal, while every browser which opens
 *       a workshop room does know it.
 */
const EMOJI_VARIATION_SELECTOR_PATTERN = new RegExp('[\\u{FE0E}\\u{FE0F}]', 'gu');
const EMOJI_SKIN_TONE_PATTERN = new RegExp('[\\u{1F3FB}-\\u{1F3FF}]', 'gu');
const EMOJI_START_PATTERN = new RegExp('^\\p{Extended_Pictographic}', 'u');
const WORKSHOP_REACTION_CLASS_NAME = 'workshop-reaction';

/**
 * The reaction as the registry knows it, no matter how the keyboard of the participant spelled it
 *
 * Note: The same emoji arrives with and without a variation selector and with any skin tone, so all of those are
 *       stripped and one registry entry answers for the whole family.
 */
export function normalizeWorkshopReactionText(reactionText: string): string {
    return reactionText.trim().replace(EMOJI_VARIATION_SELECTOR_PATTERN, '').replace(EMOJI_SKIN_TONE_PATTERN, '');
}

const WORKSHOP_REACTION_ANIMATIONS_BY_REACTION: ReadonlyMap<string, WorkshopReactionAnimationDefinition> = new Map(
    WORKSHOP_REACTION_ANIMATION_DEFINITIONS.flatMap((definition) =>
        definition.reactions.map((reaction): readonly [string, WorkshopReactionAnimationDefinition] => [
            normalizeWorkshopReactionText(reaction),
            definition,
        ]),
    ),
);

/**
 * Whether the reaction is an emoji and not a text somebody typed
 */
export function isEmojiWorkshopReaction(reactionText: string): boolean {
    return EMOJI_START_PATTERN.test(normalizeWorkshopReactionText(reactionText));
}

/**
 * How this reaction is celebrated on the stage
 *
 * Note: Anything the registry does not know still flies, only with the generic animation, so an admin can send any
 *       reaction into the room without teaching the room about it first.
 */
export function getWorkshopReactionAnimation(reactionText: string): WorkshopReactionAnimationDefinition {
    const registeredAnimation = WORKSHOP_REACTION_ANIMATIONS_BY_REACTION.get(
        normalizeWorkshopReactionText(reactionText),
    );
    if (registeredAnimation !== undefined) {
        return registeredAnimation;
    }

    return isEmojiWorkshopReaction(reactionText)
        ? GENERIC_WORKSHOP_REACTION_ANIMATION
        : GENERIC_WORKSHOP_TEXT_REACTION_ANIMATION;
}

/**
 * The same reaction told without any travel, for a participant who asked the system for less motion
 *
 * Note: The reaction only appears and fades where it started, because the operating system was asked not to move
 *       things around. It keeps its appearance, so a text reaction stays as readable as it was.
 */
export function toCalmWorkshopReactionAnimation(
    definition: WorkshopReactionAnimationDefinition,
): WorkshopReactionAnimationDefinition {
    return {
        ...definition,
        flight: 'calm',
        flourish: null,
        decoration: null,
        durationMilliseconds: CALM_WORKSHOP_REACTION_ANIMATION_DURATION_MILLISECONDS,
        scale: 1,
    };
}

function createWorkshopReactionModifierClassName(part: string, modifier: string): string {
    return `${WORKSHOP_REACTION_CLASS_NAME}-${part}--${modifier}`;
}

/**
 * The class names which the stylesheet of the room answers with the actual keyframes
 */
export type WorkshopReactionClassNames = {
    readonly root: string;
    readonly body: string;

    /**
     * The class of one decorating character, or `null` when this reaction flies alone
     */
    readonly decoration: string | null;
};

/**
 * What to put on the elements of one flying reaction
 *
 * Note: The class names are built from the very same vocabulary the stylesheet implements, so a flight or a flourish
 *       is named exactly once in the code and once in the CSS.
 */
export function getWorkshopReactionClassNames(
    definition: WorkshopReactionAnimationDefinition,
): WorkshopReactionClassNames {
    const flourishClassName =
        definition.flourish === null
            ? ''
            : ` ${createWorkshopReactionModifierClassName('flourish', definition.flourish)}`;

    return {
        root: [
            WORKSHOP_REACTION_CLASS_NAME,
            createWorkshopReactionModifierClassName('appearance', definition.appearance),
            createWorkshopReactionModifierClassName('flight', definition.flight),
        ].join(' '),
        body: `${WORKSHOP_REACTION_CLASS_NAME}__body${flourishClassName}`,
        decoration:
            definition.decoration === null
                ? null
                : `${WORKSHOP_REACTION_CLASS_NAME}__decoration ${createWorkshopReactionModifierClassName(
                      'decoration',
                      definition.decoration.motion,
                  )}`,
    };
}

/**
 * Every reaction which has an animation of its own, for the administration to preview and to offer
 *
 * Note: Only the first spelling of a reaction family is offered, because the rest of the family is there just to
 *       recognize what a participant sent, not to be listed twice in the administration.
 */
export function getAnimatedWorkshopReactions(): readonly string[] {
    return WORKSHOP_REACTION_ANIMATION_DEFINITIONS.map((definition) => definition.reactions[0]);
}
