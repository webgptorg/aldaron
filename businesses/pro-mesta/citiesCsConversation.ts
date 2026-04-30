import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const citiesCsConversation = {
    title: 'Městské vyhlášky a chodníky',
    description:
        'Dva účastníci diskutují o městských vyhláškách, zákonu 106/1999 Sb. o svobodném přístupu k informacím a opravách chodníků ve městě.',
    participants: [
        {
            name: 'USER',
            fullname: 'Petr Novák',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Lucie Svobodová',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content:
                'V posledních měsících jsme schválili novou vyhlášku, která upravuje pravidla pro opravy chodníků.\n\n\n\nCo je v ní obsaženo oproti předchozím verzím?',
            timestamp: '2024-01-15T10:00:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                    Nová vyhláška zavádí přísnější normy pro kvalitu materiálů používaných při opravách chodníků, stanovuje jasnější termíny pro dokončení prací a zvyšuje pokuty za nedodržení těchto pravidel. Dále klade větší důraz na bezpečnost chodců během oprav.


                    | Kategorie              | Předchozí vyhláška         | Nová vyhláška                        |
                    |------------------------|----------------------------|--------------------------------------|
                    | Kvalita materiálů      | Základní normy ČSN         | Přísnější normy ČSN EN 1338          |
                    | Termíny dokončení      | Bez konkrétního termínu    | Max. 30 dní od zahájení              |
                    | Pokuty za prodlení     | 5 000 Kč jednorázově       | **15% ceny zakázky** za každý měsíc  |
                    | Bezpečnost chodců      | Základní označení          | Osvětlené zábrany + dočasné přechody |
                    | Záruční doba           | 12 měsíců                  | 36 měsíců                            |


            `),
            timestamp: '2024-01-15T10:01:30Z',
        },
    ],
} satisfies Conversation;

/**
 * TODO: !!! [🌆] `/pro-mesta` Write conversation with embedded document
 */
