'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function AiSupervizeChatbot() {
    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/TODO_AI_SUPERVIZE" // TODO: fill in real agent URL
            meta={{
                fullname: 'AI Supervize – asistent',
                title: 'AI Supervize – asistent',
                description:
                    'Vysvětlí, jak AI Supervize probíhá, co z ní tým dostane a jak domluvit discovery workshop.',
                inputPlaceholder: 'Zeptejte se na průběh, cenu nebo termíny workshopu...',
            }}
        />
    );
}
