import { Conversation } from '@/lib/conversations-data';
import dariaHvizdalova from '@/public/people/daria-hvizdalova.jpeg';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import spaceTrim from 'spacetrim';

export const hackathonFactoryConversation = {
    title: 'Ukázka přihlášky do sprintu',
    description:
        'CTO posílá konkrétní problém do Hackathon Factory a během pár zpráv z něj vzniká realizovatelný sprint brief.',
    participants: [
        {
            name: 'USER',
            fullname: 'Lucie, CTO SaaS startupu',
            color: '#1c6981ff',
            personality: '',
            avatar: dariaHvizdalova.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'Jirka, Hackathon Factory',
            color: '#5df1e8ff',
            personality: '',
            avatar: jiriJahn.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Chceme přihlásit zadání do Hackathon Factory.

                Kontext:
                - B2B SaaS pro správu servisních požadavků
                - support tým ručně třídí cca 600 ticketů týdně
                - často nepoznáme, co je bug, co onboarding a co urgentní eskalace

                Cíl sprintu:
                - během 2 dnů ověřit, jestli dává smysl automatická triáž
                - vidět alespoň 2 různé přístupy
                - na konci mít demo, doporučení a hrubý plán další implementace

                Omezení:
                - žádné produkční nasazení
                - citlivé údaje musí být anonymizované
                - chceme, aby řešení šlo napojit na náš existující stack
            `),
            timestamp: '2026-03-20T09:00:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Tohle je pro Hackathon Factory dobrý kandidát. Převádím to do sprint briefu:

                ## Zadání: Triáž support ticketů pro B2B SaaS

                **Co se řeší**
                Rychlé rozpoznání typu ticketu, priority a doporučeného dalšího kroku.

                **Co má vzniknout do finále**
                - funkční demo nad anonymizovanými daty
                - srovnání alespoň 2 technických přístupů
                - doporučení, co dává smysl stavět dál a co ne
                - stručná dokumentace a návrh navazujícího sprintu

                **Jak poznáme úspěch**
                - zrychlení prvotní klasifikace ticketu
                - rozumná přesnost na prioritních kategoriích
                - jasné rozhodnutí, zda pokračovat do pilotu
            `),
            timestamp: '2026-03-20T09:01:10Z',
        },
        {
            author: 'USER',
            content:
                'Super. Doplň prosím, že chceme i doporučení, s jakým týmem nebo jednotlivci má smysl pokračovat po hackathonu.',
            timestamp: '2026-03-20T09:01:42Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Doplněno do briefu:

                **Navazující krok po sprintu**
                Pokud během hackathonu vznikne dobrý fit mezi zadáním a týmem, připravíme i doporučení na navazující spolupráci bez provize a bez závazku.

                Tím pádem je zadání připravené k publikaci pro účastníky.
            `),
            timestamp: '2026-03-20T09:02:05Z',
        },
    ],
} satisfies Conversation;
