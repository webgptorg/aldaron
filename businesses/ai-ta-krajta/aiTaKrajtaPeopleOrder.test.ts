import type { AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    orderAiTaKrajtaPeopleByAppearances,
    shuffleAiTaKrajtaPeopleByAppearances,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { describe, expect, it } from 'vitest';

/**
 * How many times a test which watches the draw itself repeats it
 */
const DRAW_COUNT = 500;

function createPerson(id: string): AiTaKrajtaPerson {
    return {
        id,
        name: id,
        role: 'host',
        headline: 'Mluví do mikrofonu.',
        url: null,
        photoFileName: null,
        mentionPatterns: [],
        episodeNumbers: [],
    };
}

const PEOPLE: readonly AiTaKrajtaPerson[] = [
    createPerson('guest-of-one-episode'),
    createPerson('never-named'),
    createPerson('host-of-every-episode'),
    createPerson('returning-guest'),
];

const EPISODE_COUNT_BY_PERSON_ID: ReadonlyMap<string, number> = new Map([
    ['guest-of-one-episode', 1],
    ['host-of-every-episode', 40],
    ['returning-guest', 3],
]);

/**
 * Draws the roster over and over and writes down every place each person ever took
 */
function collectPlacesByPersonId(): ReadonlyMap<string, ReadonlySet<number>> {
    const placesByPersonId = new Map(PEOPLE.map((person) => [person.id, new Set<number>()]));

    for (let drawIndex = 0; drawIndex < DRAW_COUNT; drawIndex++) {
        shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random).forEach(
            (person, place) => placesByPersonId.get(person.id)!.add(place),
        );
    }

    return placesByPersonId;
}

describe('orderAiTaKrajtaPeopleByAppearances', () => {
    it('leads with the person the archive names most often', () => {
        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);

        expect(ordered.map((person) => person.id)).toEqual([
            'host-of-every-episode',
            'returning-guest',
            'guest-of-one-episode',
            'never-named',
        ]);
    });

    it('keeps the order of the roster between people who are named equally often', () => {
        const ordered = orderAiTaKrajtaPeopleByAppearances(PEOPLE, new Map());

        expect(ordered.map((person) => person.id)).toEqual(PEOPLE.map((person) => person.id));
    });

    it('leaves the roster it was given alone', () => {
        orderAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID);

        expect(PEOPLE[0].id).toBe('guest-of-one-episode');
    });
});

describe('shuffleAiTaKrajtaPeopleByAppearances', () => {
    it('shows everybody of the roster exactly once', () => {
        const shuffled = shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random);

        expect(new Set(shuffled.map((person) => person.id)).size).toBe(PEOPLE.length);
    });

    it('puts the person of the most episodes on top far more often than the guest of a single one', () => {
        const topPersonIds = Array.from(
            { length: DRAW_COUNT },
            () => shuffleAiTaKrajtaPeopleByAppearances(PEOPLE, EPISODE_COUNT_BY_PERSON_ID, Math.random)[0].id,
        );

        const hostTopCount = topPersonIds.filter((personId) => personId === 'host-of-every-episode').length;
        const guestTopCount = topPersonIds.filter((personId) => personId === 'guest-of-one-episode').length;

        expect(hostTopCount).toBeGreaterThan(guestTopCount * 3);

        // Note: Leaning towards somebody is not a ranking of them, so even the person of every episode has to be
        //       overtaken now and then.
        expect(hostTopCount).toBeLessThan(DRAW_COUNT);
    });

    it('moves even somebody the archive never names around the list', () => {
        const placesOfNeverNamed = collectPlacesByPersonId().get('never-named')!;

        expect(placesOfNeverNamed.size).toBeGreaterThan(1);
        expect(placesOfNeverNamed.has(0)).toBe(true);
    });

    it('draws the same order twice out of the same numbers', () => {
        const createConstantRandomNumber = () => 0.5;

        const firstDraw = shuffleAiTaKrajtaPeopleByAppearances(
            PEOPLE,
            EPISODE_COUNT_BY_PERSON_ID,
            createConstantRandomNumber,
        );
        const secondDraw = shuffleAiTaKrajtaPeopleByAppearances(
            PEOPLE,
            EPISODE_COUNT_BY_PERSON_ID,
            createConstantRandomNumber,
        );

        expect(firstDraw.map((person) => person.id)).toEqual(secondDraw.map((person) => person.id));
    });
});
