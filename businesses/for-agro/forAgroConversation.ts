import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const forAgroConversation = {
    title: 'Agronomický expert a compliance',
    description:
        'Ukázka rozhovoru, ve kterém agronomický tým řeší symptomy na pšenici, doporučený interní postup a evidenci zásahu.',
    participants: [
        {
            name: 'USER',
            fullname: 'Eva, hlavní agronomka',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Agro AI Expert',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Na třech lokalitách po deštích vidíme žloutnutí a skvrny na listech pšenice.

                Potřebuju rychle sjednotit doporučení pro terén:
                - jak odlišit padlí od septoriózy
                - jaký interní postup spustit
                - co zapsat kvůli compliance a evidenci zásahu
            `),
            timestamp: '2026-03-11T07:30:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Jasně. Tady je pracovní doporučení pro regionální tým:

                ## 1. Rychlé rozlišení v terénu

                | Příznak | Padlí travní | Septorióza pšenice |
                |---|---|---|
                | Povrch listu | bělavý moučný povlak | nepravidelné skvrny se žlutým lemem |
                | Typ šíření | často od spodních pater za suššího počasí | rychleji po deštích a při vysoké vlhkosti |
                | Co ověřit | intenzitu povlaku a napadení odnoží | rozsah skvrn, lokalitu a vývoj v horních listech |

                ## 2. Doporučený interní postup
                1. Potvrdit symptomy na každé lokalitě a přiložit fotodokumentaci.
                2. Porovnat stav s posledním monitoringem a počasím za posledních 7 dní.
                3. Rozhodnout, zda stačí lokální zásah, nebo je potřeba plošné doporučení pro celý region.
                4. Pokud je výskyt nejasný nebo rozsáhlý, eskalovat na seniorního agronoma.

                ## 3. Co zapsat do evidence a compliance
                - lokalita, kultura, odrůda, datum zjištění
                - pozorované symptomy a rozsah napadení
                - doporučený / provedený zásah a odpovědná osoba
                - použitý přípravek, dávkování a důvod rozhodnutí
                - návaznost na interní metodiku a záznam o schválení

                ## 4. Poznámka pro tým
                Pokud si nejsme jistí diagnózou, doporučuji nejdřív potvrdit původce a teprve potom sjednotit zásah pro všechny lokality.
            `),
            timestamp: '2026-03-11T07:31:10Z',
        },
    ],
} satisfies Conversation;
