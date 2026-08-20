import {
    getAnimatedWorkshopReactions,
    getWorkshopReactionAnimation,
    getWorkshopReactionClassNames,
    isEmojiWorkshopReaction,
    MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT,
    normalizeWorkshopReactionText,
    toCalmWorkshopReactionAnimation,
    WORKSHOP_REACTION_ANIMATION_DEFINITIONS,
    WORKSHOP_REACTION_APPEARANCES,
    WORKSHOP_REACTION_DECORATION_MOTIONS,
    WORKSHOP_REACTION_FLIGHTS,
    WORKSHOP_REACTION_FLOURISHES,
} from '@/lib/workshops/workshopReactionAnimations';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REACTIONS_WITH_OWN_ANIMATION = [
    '👍',
    '❤️',
    '👏',
    '🔥',
    '💡',
    '😂',
    '</>',
    '✨',
    '🐍',
    '👀',
    '🎉',
    '🎆',
    '👩‍💻',
] as const;

const ANIMATION_STYLESHEET_PATH = path.resolve(process.cwd(), 'components/workshops/workshopReactionAnimations.css');
const ANIMATION_STYLESHEET = readFileSync(ANIMATION_STYLESHEET_PATH, 'utf8');

describe('workshop reaction animations', () => {
    it('celebrates every asked-for reaction its own way', () => {
        const animations = REACTIONS_WITH_OWN_ANIMATION.map(getWorkshopReactionAnimation);
        const animationKeys = animations.map((animation) => animation.key);
        const animationMovements = animations.map((animation) => `${animation.flight}/${animation.flourish}`);

        expect(new Set(animationKeys).size).toBe(REACTIONS_WITH_OWN_ANIMATION.length);
        expect(new Set(animationMovements).size).toBe(REACTIONS_WITH_OWN_ANIMATION.length);
        animationKeys.forEach((animationKey) => {
            expect(animationKey).not.toBe('generic');
            expect(animationKey).not.toBe('generic-text');
        });
    });

    it('describes every animation exactly once and only with the vocabulary the stylesheet knows', () => {
        const animationKeys = WORKSHOP_REACTION_ANIMATION_DEFINITIONS.map((definition) => definition.key);

        expect(new Set(animationKeys).size).toBe(animationKeys.length);
        WORKSHOP_REACTION_ANIMATION_DEFINITIONS.forEach((definition) => {
            expect(definition.adminLabel.length).toBeGreaterThan(0);
            expect(definition.reactions.length).toBeGreaterThan(0);
            expect(definition.durationMilliseconds).toBeGreaterThan(0);
            expect(definition.scale).toBeGreaterThan(0);
            expect(WORKSHOP_REACTION_FLIGHTS).toContain(definition.flight);
            expect(WORKSHOP_REACTION_FLOURISHES).toContain(definition.flourish);
            expect(WORKSHOP_REACTION_APPEARANCES).toContain(definition.appearance);
            if (definition.decoration !== null) {
                expect(WORKSHOP_REACTION_DECORATION_MOTIONS).toContain(definition.decoration.motion);
                expect(definition.decoration.count).toBeGreaterThan(0);
                expect(definition.decoration.count).toBeLessThanOrEqual(MAXIMAL_WORKSHOP_REACTION_DECORATION_COUNT);
            }
        });
    });

    it('offers no reaction to two animations at once', () => {
        const registeredReactions = WORKSHOP_REACTION_ANIMATION_DEFINITIONS.flatMap((definition) =>
            definition.reactions.map(normalizeWorkshopReactionText),
        );

        expect(new Set(registeredReactions).size).toBe(registeredReactions.length);
    });

    it('flies an unknown emoji with the generic animation, exactly as the room did before', () => {
        const unknownEmojiAnimation = getWorkshopReactionAnimation('🦄');

        expect(unknownEmojiAnimation.key).toBe('generic');
        expect(unknownEmojiAnimation.flight).toBe('float');
        expect(unknownEmojiAnimation.appearance).toBe('emoji');
    });

    it('flies an arbitrary text with the generic animation, only readable', () => {
        const textAnimation = getWorkshopReactionAnimation('deploy!');

        expect(textAnimation.key).toBe('generic-text');
        expect(textAnimation.flight).toBe('float');
        expect(textAnimation.appearance).toBe('code');
        expect(getWorkshopReactionAnimation('').key).toBe('generic-text');
    });

    it('recognizes the same reaction however the keyboard of the participant spelled it', () => {
        expect(getWorkshopReactionAnimation('❤️').key).toBe('heart');
        expect(getWorkshopReactionAnimation('❤').key).toBe('heart');
        expect(getWorkshopReactionAnimation(' 👍 ').key).toBe('thumbs-up');
        expect(getWorkshopReactionAnimation('👍🏽').key).toBe('thumbs-up');
        expect(getWorkshopReactionAnimation('👩🏿‍💻').key).toBe('developer');
        expect(normalizeWorkshopReactionText('👏🏻')).toBe('👏');
    });

    it('tells an emoji from a text somebody typed', () => {
        expect(isEmojiWorkshopReaction('🎉')).toBe(true);
        expect(isEmojiWorkshopReaction('👩‍💻')).toBe(true);
        expect(isEmojiWorkshopReaction('</>')).toBe(false);
        expect(isEmojiWorkshopReaction('lol')).toBe(false);
        expect(isEmojiWorkshopReaction('')).toBe(false);
    });

    it('builds the class names of a flight out of the very same vocabulary', () => {
        const partyClassNames = getWorkshopReactionClassNames(getWorkshopReactionAnimation('🎉'));

        expect(partyClassNames.root).toBe(
            'workshop-reaction workshop-reaction-appearance--emoji workshop-reaction-flight--launch',
        );
        expect(partyClassNames.body).toBe('workshop-reaction__body workshop-reaction-flourish--burst');
        expect(partyClassNames.decoration).toBe('workshop-reaction__decoration workshop-reaction-decoration--scatter');
    });

    it('leaves a reaction where it was sent when the participant asked for less motion', () => {
        const calmAnimation = toCalmWorkshopReactionAnimation(getWorkshopReactionAnimation('🎆'));
        const calmClassNames = getWorkshopReactionClassNames(calmAnimation);

        expect(calmAnimation.flight).toBe('calm');
        expect(calmAnimation.flourish).toBeNull();
        expect(calmAnimation.decoration).toBeNull();
        expect(calmAnimation.durationMilliseconds).toBeGreaterThan(0);
        expect(calmClassNames.body).toBe('workshop-reaction__body');
        expect(calmClassNames.decoration).toBeNull();
        expect(toCalmWorkshopReactionAnimation(getWorkshopReactionAnimation('</>')).appearance).toBe('code');
    });

    it('offers every animated reaction to the administration exactly once', () => {
        const animatedReactions = getAnimatedWorkshopReactions();

        expect(new Set(animatedReactions).size).toBe(animatedReactions.length);
        REACTIONS_WITH_OWN_ANIMATION.forEach((reaction) => {
            expect(animatedReactions).toContain(reaction);
        });
    });

    it('is answered by the stylesheet for every word of the vocabulary', () => {
        WORKSHOP_REACTION_FLIGHTS.forEach((flight) => {
            expect(ANIMATION_STYLESHEET).toContain(`.workshop-reaction-flight--${flight}`);
            expect(ANIMATION_STYLESHEET).toContain(`@keyframes workshop-reaction-flight-${flight}`);
        });
        WORKSHOP_REACTION_FLOURISHES.forEach((flourish) => {
            expect(ANIMATION_STYLESHEET).toContain(`.workshop-reaction-flourish--${flourish}`);
            expect(ANIMATION_STYLESHEET).toContain(`@keyframes workshop-reaction-flourish-${flourish}`);
        });
        WORKSHOP_REACTION_DECORATION_MOTIONS.forEach((decorationMotion) => {
            expect(ANIMATION_STYLESHEET).toContain(`.workshop-reaction-decoration--${decorationMotion}`);
            expect(ANIMATION_STYLESHEET).toContain(`@keyframes workshop-reaction-decoration-${decorationMotion}`);
        });
        WORKSHOP_REACTION_APPEARANCES.forEach((appearance) => {
            expect(ANIMATION_STYLESHEET).toContain(`.workshop-reaction-appearance--${appearance}`);
        });
    });

    it('animates nothing but what the compositor can carry, so a full stage costs no layout', () => {
        const keyframeBlockPattern = /@keyframes[^{]*\{([\s\S]*?)\n\}/g;
        const animatedPropertyPattern = /^\s*([a-z-]+)\s*:/gm;
        const keyframeBlocks = Array.from(ANIMATION_STYLESHEET.matchAll(keyframeBlockPattern));

        expect(keyframeBlocks.length).toBeGreaterThan(WORKSHOP_REACTION_FLIGHTS.length);
        keyframeBlocks.forEach(([, keyframeBlock]) => {
            Array.from(keyframeBlock.matchAll(animatedPropertyPattern)).forEach(([, animatedProperty]) => {
                expect(['transform', 'opacity', 'filter']).toContain(animatedProperty);
            });
        });
    });

    it('still calms a reaction down when the browser answers the question about motion late', () => {
        expect(ANIMATION_STYLESHEET).toContain('@media (prefers-reduced-motion: reduce)');
    });
});
