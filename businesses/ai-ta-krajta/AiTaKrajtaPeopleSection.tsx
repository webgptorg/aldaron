'use client';

import { useAiTaKrajtaPageState } from '@/businesses/ai-ta-krajta/AiTaKrajtaPageState';
import { countAiTaKrajtaEpisodesByPerson } from '@/businesses/ai-ta-krajta/aiTaKrajtaEpisodePeople';
import { getAiTaKrajtaPeopleByRole, type AiTaKrajtaPersonRole } from '@/businesses/ai-ta-krajta/aiTaKrajtaPeople';
import { AiTaKrajtaPersonCard } from '@/businesses/ai-ta-krajta/AiTaKrajtaPersonCard';
import { AI_TA_KRAJTA_SECTION_IDS } from '@/businesses/ai-ta-krajta/config';
import { useMemo } from 'react';

/**
 * Heading of each of the two groups of people
 */
const GROUP_TITLE_BY_ROLE: Readonly<Record<AiTaKrajtaPersonRole, string>> = {
    host: 'U mikrofonu',
    guest: 'Byli u nás',
};

/**
 * People of the show, each of them a button which narrows the archive down to their episodes
 */
export function AiTaKrajtaPeopleSection() {
    const { archive, viewState, togglePersonFilter } = useAiTaKrajtaPageState();

    const episodeCountByPersonId = useMemo(
        () => countAiTaKrajtaEpisodesByPerson(archive.episodes),
        [archive.episodes],
    );

    const handleSelect = (personId: string) => {
        togglePersonFilter(personId);

        // Note: The cards are below the archive they filter, so the visitor has to be taken back up to see what their
        //       click did.
        document
            .getElementById(AI_TA_KRAJTA_SECTION_IDS.EPISODES)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section id={AI_TA_KRAJTA_SECTION_IDS.PEOPLE} className="scroll-mt-28 md:scroll-mt-20 border-t border-white/10 py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Kdo v tom jede</h2>
                <p className="mt-3 max-w-2xl text-white/60">
                    U mikrofonu se střídáme podle toho, kdo má co říct k tématu. Klikněte na kohokoliv a v archivu
                    nahoře zůstanou jen díly, ve kterých je slyšet.
                </p>
                <p className="mt-2 max-w-2xl text-sm text-white/40">
                    Sestavu bereme z popisků dílů. Když popisek někoho nezmíní, u dílu prostě nesvítí.
                </p>

                {(Object.keys(GROUP_TITLE_BY_ROLE) as AiTaKrajtaPersonRole[]).map((role) => (
                    <div key={role} className="mt-12">
                        <h3 className="text-xs uppercase tracking-[0.16em] text-white/40">
                            {GROUP_TITLE_BY_ROLE[role]}
                        </h3>

                        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {getAiTaKrajtaPeopleByRole(role).map((person) => (
                                <li key={person.id}>
                                    <AiTaKrajtaPersonCard
                                        person={person}
                                        episodeCount={episodeCountByPersonId.get(person.id) ?? 0}
                                        isSelected={viewState.personId === person.id}
                                        onSelect={() => handleSelect(person.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
