import { Conversation } from '@/lib/conversations-data';
import jiriJahn from '@/public/people/jiri-jahn-transparent-square.png';
import pavolHejny from '@/public/people/pavol-hejny-transparent-square.png';
import spaceTrim from 'spacetrim';

export const aiSupervizeConversation = {
    title: 'AI coding review v TypeScriptu',
    description:
        'Tech Lead sdílí problém s AI-generovaným autosave hookem a AI supervizor navrhuje bezpečnější workflow i úpravu implementace.',
    participants: [
        {
            name: 'USER',
            fullname: 'Martin, Tech Lead',
            color: '#1c6981ff',
            personality: '',
            avatar: jiriJahn.src,
            isMe: true,
        },
        {
            name: 'SUPERVISOR',
            fullname: 'Pavol, AI Supervize',
            color: '#5df1e8ff',
            personality: '',
            avatar: pavolHejny.src,
        },
    ],
    messages: [
        {
            author: 'USER',
            content: spaceTrim(`
                Cursor nám vygeneroval autosave hook pro Next.js admin. Na první pohled funguje, ale občas přepíše novější draft starším requestem a PR má skoro 600 řádků.

                Jak bys to řešil v rámci AI Supervize, aby to nebylo jen další promptování naslepo?
            `),
            timestamp: '2026-03-11T09:00:00Z',
        },
        {
            author: 'SUPERVISOR',
            content: spaceTrim(`
                Nejdřív bych nastavil pravidlo do playbooku: AI smí generovat po malých krocích, každé AI PR musí mít test na rizikové side-effecty a všechny async operace musí umět clean-up.

                Tady je hlavní problém race condition mezi requesty. Bezpečnější TypeScript verze může vypadat takto:

                \`\`\`ts
                type UseAutosaveDraftProps = {
                    draftId: string | null;
                    values: Record<string, unknown>;
                };

                export function useAutosaveDraft({ draftId, values }: UseAutosaveDraftProps) {
                    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
                    const latestRequestRef = useRef(0);

                    useEffect(() => {
                        if (!draftId) return;

                        const controller = new AbortController();
                        const timeout = window.setTimeout(async () => {
                            const requestId = ++latestRequestRef.current;
                            setStatus('saving');

                            try {
                                await saveDraft(draftId, values, { signal: controller.signal });

                                if (requestId === latestRequestRef.current) {
                                    setStatus('saved');
                                }
                            } catch (error) {
                                if (!controller.signal.aborted && requestId === latestRequestRef.current) {
                                    setStatus('error');
                                }
                            }
                        }, 600);

                        return () => {
                            controller.abort();
                            window.clearTimeout(timeout);
                        };
                    }, [draftId, values]);

                    return status;
                }
                \`\`\`

                A do workflow bych z toho zapsal:
                1. AI PR rozdělit pod 150 řádků a oddělit refactor od feature logiky.
                2. Prompt šablona musí vyžadovat edge-cases, clean-up a test plan.
                3. Review checklist má hlídat abort, stale closure a observability.
            `),
            timestamp: '2026-03-11T09:01:30Z',
        },
    ],
} satisfies Conversation;
