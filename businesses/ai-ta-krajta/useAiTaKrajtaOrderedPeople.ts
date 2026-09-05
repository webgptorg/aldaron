'use client';

import { AI_TA_KRAJTA_PEOPLE, type AiTaKrajtaPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import {
    orderAiTaKrajtaPeopleByAppearances,
    shuffleAiTaKrajtaPeopleByAppearances,
} from '@/businesses/ai-ta-krajta/aiTaKrajtaPeopleOrder';
import { useEffect, useState } from 'react';

/**
 * The whole roster of the show in the order this one visit shows it in
 *
 * Note: The order is drawn, so the server cannot be the one drawing it - it would send one order, the browser would
 *       hydrate into another and React would throw the section away and build it again. The page is therefore rendered
 *       in the order the draw leans towards, from the most often heard person to the least often heard one, and the
 *       draw itself is made once the section is alive in the browser.
 *
 * Note: The drawn order is deliberately not in the address bar. A shared link is about an episode or about a person,
 *       never about who happened to come out on top of the roster this time.
 *
 * @param episodeCountByPersonId how many episodes of the archive each person is named in
 */
export function useAiTaKrajtaOrderedPeople(
    episodeCountByPersonId: ReadonlyMap<string, number>,
): readonly AiTaKrajtaPerson[] {
    const [orderedPeople, setOrderedPeople] = useState<readonly AiTaKrajtaPerson[]>(() =>
        orderAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId),
    );

    useEffect(() => {
        setOrderedPeople(
            shuffleAiTaKrajtaPeopleByAppearances(AI_TA_KRAJTA_PEOPLE, episodeCountByPersonId, Math.random),
        );
    }, [episodeCountByPersonId]);

    return orderedPeople;
}
