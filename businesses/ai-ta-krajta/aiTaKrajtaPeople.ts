/**
 * Whether a person sits at the microphone regularly or came for one conversation
 */
export type AiTaKrajtaPersonRole = 'host' | 'guest';

export type AiTaKrajtaPerson = {
    /**
     * Identifier which the filter of the episode list carries in the address of the page
     */
    readonly id: string;

    readonly name: string;
    readonly role: AiTaKrajtaPersonRole;

    /**
     * What the person does, in one line and only as far as the episodes of the show actually say it
     */
    readonly headline: string;

    /**
     * Where the person can be found, `null` when they publish no page of their own
     */
    readonly url: string | null;

    /**
     * Photograph of the person, `null` when the page draws their initials instead
     */
    readonly photoPath: string | null;

    /**
     * Pieces of text which name this person in an episode title or description, including Czech declensions
     *
     * Note: They are matched without regard to letter case, so `koblíž` finds both `Koblížek` and `Koblížkem`. Keep
     *       them long enough not to match a different word - a wrong face next to an episode is worse than none.
     */
    readonly mentionPatterns: readonly string[];

    /**
     * Episodes this person took part in but which do not name them
     *
     * Note: The podcast feed is the source of truth and most descriptions do name who is at the microphone. This list
     *       is here for the rest, so an editor can attribute an episode by hand without touching any component.
     */
    readonly episodeNumbers: readonly number[];
};

/**
 * Everyone the show has introduced by name, hosts first
 *
 * Note: Every line here is taken from the episode descriptions of the show or from the site itself. Nobody is given a
 *       title the show has not given them.
 */
export const AI_TA_KRAJTA_PEOPLE: readonly AiTaKrajtaPerson[] = [
    {
        id: 'pavol-hejny',
        name: 'Pavol Hejný',
        role: 'host',
        headline: 'AI konzultant a vývojář. Staví AI agenty a v dílech je rozebírá z praxe.',
        url: 'https://www.ptbk.io/pavol',
        photoPath: '/people/pavol-hejny-transparent-square.png',
        mentionPatterns: ['pavol', 'pavlem', 'hejn'],
        episodeNumbers: [],
    },
    {
        id: 'jiri-jahn',
        name: 'Jiří Jahn',
        role: 'host',
        headline: 'Řeší, co z AI firma reálně použije. Tahá debatu k praktickým otázkám.',
        url: 'https://www.ptbk.io/jirka',
        photoPath: '/people/jiri-jahn-transparent-square.png',
        mentionPatterns: ['jirka', 'jirkou', 'jirkovi', 'jiří jahn', 'jiřím jahnem'],
        episodeNumbers: [],
    },
    {
        id: 'petr-glaser',
        name: 'Petr Glaser',
        role: 'host',
        headline: 'Vývojář, píše bleeding.dev. Testuje nové modely dřív, než se o nich začne psát.',
        url: 'https://bleeding.dev/',
        photoPath: null,
        // Note: Plain `petrem` would also catch the díl with Petrem Brzkem, so the patterns keep the comma and the
        //       conjunction which the descriptions write when they list who sat at the microphone.
        mentionPatterns: ['glaser', 'petrem,', 'petrem a '],
        episodeNumbers: [],
    },
    {
        id: 'patrik-braborec',
        name: 'Patrik Braborec',
        role: 'host',
        headline: 'Součást klasické sestavy podcastu. Drží díly pohromadě a hlídá, aby debata nesklouzla do hype.',
        url: null,
        photoPath: null,
        mentionPatterns: ['patrik', 'patrikem', 'braborec'],
        episodeNumbers: [],
    },
    {
        id: 'jacek-soubusta',
        name: 'Jacek Soubusta',
        role: 'host',
        headline: 'Data a nástroje kolem AI. Umí veřejně přiznat, že vlastní MCP server spláchl do záchodu.',
        url: null,
        photoPath: null,
        mentionPatterns: ['jacek', 'jackem', 'soubust'],
        episodeNumbers: [],
    },
    {
        id: 'simon-podhajsky',
        name: 'Šimon Podhajský',
        role: 'host',
        headline: 'Přednášel na AI Engineer o read-only AI a kognitivních výparech. Nejskeptičtější hlas u stolu.',
        url: null,
        photoPath: null,
        mentionPatterns: ['šimon', 'šimonov', 'podhajsk'],
        episodeNumbers: [],
    },
    {
        id: 'roman-baranovic',
        name: 'Roman Baranovič',
        role: 'guest',
        headline: 'Expert na digitální transformaci školství. Vrací se do dílů o AI ve školách.',
        url: 'https://narnia.sk/employees/roman-baranovic-2/',
        photoPath: null,
        mentionPatterns: ['baranovi'],
        episodeNumbers: [],
    },
    {
        id: 'katka-fajmanova',
        name: 'Katka Fajmanová',
        role: 'guest',
        headline: 'Architektura a interpretabilita modelů. Díl o tom, co se děje uvnitř sítě.',
        url: null,
        photoPath: null,
        mentionPatterns: ['fajman'],
        episodeNumbers: [],
    },
    {
        id: 'tomas-koblizek',
        name: 'Tomáš Koblížek',
        role: 'guest',
        headline: 'Analytický filozof, spoluautor knihy Dezinformace a Hate Speech.',
        url: null,
        photoPath: null,
        mentionPatterns: ['koblíž'],
        episodeNumbers: [],
    },
    {
        id: 'adam-zvada',
        name: 'Adam Zvada',
        role: 'guest',
        headline: 'Prodal Steer Code firmě Expo. Mluvil o agent engineeringu a orchestraci agentů.',
        url: null,
        photoPath: null,
        mentionPatterns: ['zvad'],
        episodeNumbers: [],
    },
    {
        id: 'lukas-caha',
        name: 'Lukáš Caha',
        role: 'guest',
        headline: 'Zakladatel Youklidu. Ukázal, že se dá růst i tak, že AI hype ignorujete.',
        url: 'https://youklid.cz/',
        photoPath: null,
        mentionPatterns: ['caha', 'cahou', 'youklid'],
        episodeNumbers: [],
    },
    {
        id: 'richard-mladek',
        name: 'Richard Mládek',
        role: 'guest',
        headline: 'Staví autonomní kódovací agenty ovládané přes Telegram. Díl o AI psychóze z produktivity.',
        url: null,
        photoPath: null,
        mentionPatterns: ['mládek', 'mládk'],
        episodeNumbers: [],
    },
    {
        id: 'dalibor-krejci',
        name: 'Dalibor Krejčí',
        role: 'guest',
        headline: 'Česká odnož hnutí PAUSE AI. Přišel obhájit moratorium na vývoj pokročilých modelů.',
        url: null,
        photoPath: null,
        mentionPatterns: ['dalibor', 'krejčí', 'krejčího'],
        episodeNumbers: [],
    },
    {
        id: 'petr-brzek',
        name: 'Petr Brzek',
        role: 'guest',
        headline: 'Macaly, český AI startup. Díl o tom, co drží second time founders nad vodou.',
        url: null,
        photoPath: null,
        // Note: Only the instrumental case, because that is how a description says that the show talked with him.
        //       The nominative also appears in a díl which only mentions him as an example.
        mentionPatterns: ['brzkem'],
        episodeNumbers: [],
    },
];

/**
 * Finds the person a link or a filter names
 *
 * @returns the person, `null` when nobody of that identifier is in the roster
 */
export function getAiTaKrajtaPersonById(personId: string | null): AiTaKrajtaPerson | null {
    return AI_TA_KRAJTA_PEOPLE.find((person) => person.id === personId) ?? null;
}

/**
 * Everyone who sits at the microphone regularly
 */
export function getAiTaKrajtaPeopleByRole(role: AiTaKrajtaPersonRole): readonly AiTaKrajtaPerson[] {
    return AI_TA_KRAJTA_PEOPLE.filter((person) => person.role === role);
}
