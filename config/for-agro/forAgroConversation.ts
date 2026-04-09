import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

/**
 * Demo conversation shown in the hero section of `/for-agro`.
 */
export const forAgroConversation = {
    title: 'Agronomie a compliance v praxi',
    description:
        'Diskuze o chorobách pšenice, správě půdy a regulatorních požadavcích v zemědělské společnosti.',
    participants: [
        {
            name: 'USER',
            fullname: 'Marek Dvořák',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'AI agronom',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content:
                'Na 120 ha pšenice se objevují skvrny na listech.\n\nMůžete navrhnout rychlý diagnostický postup, doporučené kroky na poli a co připravit pro compliance kontrolu?',
            timestamp: '2025-09-10T07:20:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Jasně. Nejprve oddělíme **diagnostiku**, **zásah** a **compliance dokumentaci**:

                1. Ověřte výskyt na reprezentativních místech (okraje, střed, vlhčí části pole).
                2. Zaznamenejte stadium plodiny, poslední aplikace a meteorologické podmínky.
                3. Proveďte fotodokumentaci a odeberte vzorky pro laboratorní potvrzení.
                4. Připravte varianty zásahu podle intenzity napadení a povolených přípravků.
                5. Zapište rozhodnutí do interního protokolu a navazující kontrolní termín.

                | Oblast | Co udělat hned | Co doložit |
                |---|---|---|
                | Diagnostika | Odběr vzorků + fotky | Protokol z terénu |
                | Zásah | Návrh aplikace dle stavu porostu | Evidence přípravků |
                | Compliance | Kontrola limitů a postupů | Auditní záznam + odpovědná osoba |
            `),
            timestamp: '2025-09-10T07:21:35Z',
        },
    ],
} satisfies Conversation;

