import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const aiSupervizeConversation = {
    title: 'PRD pro pilot AI Supervize',
    description:
        'Ukázka rozhovoru, ve kterém CTO formuluje pilot AI Supervize a AI pomáhá převést zadání do konkrétního PRD.',
    participants: [
        {
            name: 'USER',
            fullname: 'Martin, CTO',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'AGENT',
            fullname: 'AI Supervizor',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Potřebuju sepsat krátké PRD pro pilot AI Supervize v našem Next.js týmu.

                Kontext:
                - 7 vývojářů
                - TypeScript / Next.js / Node.js
                - AI používáme ad-hoc v Cursoru a Copilotu
                - review se nám prodlužuje a PRka bývají moc velká
                - nechceme posílat citlivý kód do náhodných nástrojů

                Cíl:
                - zkrátit time-to-merge
                - snížit rework
                - nastavit jasná pravidla, kdo a kdy používá AI
            `),
            timestamp: '2026-02-03T09:30:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Jasně. Tady je návrh stručného PRD pro pilot:

                ## PRD: Pilot AI Supervize pro produktový tým

                **Cíl projektu**
                Zavést AI do vývoje tak, aby byla použitelná bezpečně, opakovatelně a s měřitelným dopadem na delivery.

                **Primární KPI**
                - zkrácení median time-to-merge o 20 %
                - snížení reopen rate u PR o 15 %
                - zkrácení doby review o 25 %

                **Rozsah pilotu**
                - 2 sprinty
                - use-casy: PRD -> issue -> PR outline, test scaffolding, refactor menších modulů, PR review checklist
                - tooling: schválený editor + schválené modely + pravidla pro citlivá data

                **Non-goals**
                - plná automatizace implementace bez review
                - používání AI na produkční incidenty bez guardrailů
                - nasazení nového nástroje každému bez jednotného workflow

                **Výstupy pilotu**
                - AI Development Playbook
                - Tool & Model Matrix
                - PR / issue / PRD šablony
                - dashboard pro metriky pilotu
            `),
            timestamp: '2026-02-03T09:31:10Z',
        },
        {
            author: 'USER',
            content: 'Doplň ještě prosím bezpečnost a konkrétní rollout pro prvních 30 dní.',
            timestamp: '2026-02-03T09:31:45Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Doplněno:

                ## Bezpečnostní pravidla
                - do externích modelů nepůjde proprietární kód bez schválené redakce
                - tým používá jen schválené nástroje a účty
                - každý AI-pomáhaný PR obsahuje označení použité asistence a kontrolní checklist

                ## Rollout 30 dní
                **Týden 1:** discovery, schválení use-case pilotu, baseline metrik
                **Týden 2:** nastavení nástrojů, datových pravidel a týmových šablon
                **Týden 3:** pilot ve dvou vybraných workstreamech, měření time-to-merge a review time
                **Týden 4:** vyhodnocení, úprava playbooku a rozhodnutí scale / stop / iterate

                Pokud chceš, rozepíšu z toho rovnou i issue template a review checklist.
            `),
            timestamp: '2026-02-03T09:32:25Z',
        },
    ],
} satisfies Conversation;
