import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const aiSupervizeConversation = {
    title: 'AI workflow v týmu',
    description: 'Ukázka krátké supervize mezi Tech Leadem a AI konzultantem nad kvalitou PR workflow.',
    participants: [
        {
            name: 'USER',
            fullname: 'Tech Lead',
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
            content:
                'AI používáme v týmu ad-hoc. Někomu to šetří čas, ale PR jsou nekonzistentní a review nám trvá dlouho. Kde začít?',
            timestamp: '2026-02-20T09:00:00Z',
        },
        {
            author: 'AGENT',
            content: spaceTrim(`
                Začneme třemi kroky: sjednocení workflow, pravidla pro citlivá data a měření dopadu.

                | Oblast | Co nastavíme | Metrika |
                |---|---|---|
                | Tvorba změn | PRD -> Issue -> PR šablony + DoD | Lead time do merge |
                | Review | AI-assisted checklist + limity velikosti PR | Doba review, reopen rate |
                | Kvalita | Guardrails pro testy a regresní scénáře | Incident rate |

                Výstupem bude playbook pro váš stack, ne obecná prezentace.
            `),
            timestamp: '2026-02-20T09:01:10Z',
        },
    ],
} satisfies Conversation;
