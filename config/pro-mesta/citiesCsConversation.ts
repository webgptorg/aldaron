import { Conversation } from '@/lib/conversations-data';
import spaceTrim from 'spacetrim';

export const citiesCsConversation = {
    title: 'Městské vyhlášky a chodníky',
    description:
        'Tři účastníci diskutují o městských vyhláškách, zákonu 106/1999 Sb. o svobodném přístupu k informacím a opravách chodníků ve městě.',
    participants: [
        {
            name: 'USER',
            fullname: 'Petr Novák',
            color: '#FF6B6B',
            personality: '',
            avatar: '',
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Lucie Svobodová',
            color: '#4ECDC4',
            personality: '',
            avatar: '',
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


                    | Kategorie          | Předchozí vyhláška | Nová vyhláška |
                    |--------------------|--------------------|----------------|
                    | Kvalita materiálů  | Základní normy     | Přísnější normy|
                    | Termíny dokončení  | Nejasné            | Jasné          |
                    | Pokuty             | Nižší              | Vyšší          |
                    | Bezpečnost chodců  | Základní opatření  | Zvýšený důraz  |


            `),
            timestamp: '2024-01-15T10:01:30Z',
        },
    ],
} satisfies Conversation;

/**
 * TODO: !!! [🌆] `/pro-mesta` Write conversation with embedded document
 */
