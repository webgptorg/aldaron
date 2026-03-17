'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function AiSupervizeChatbot() {
 return <></>;

    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/TODO_AI_SUPERVIZE" // TODO: fill in real agent URL
            meta={{
                fullname: 'AI Supervize – asistent',
                title: 'AI Supervize – asistent',
                description:
                    'Pomáhá firmám pochopit, co AI Supervize obnáší, jaké jsou přínosy a jak si domluvit discovery workshop.',
                inputPlaceholder: 'Zeptejte se na průběh supervize, ceník nebo termíny workshopu...',
            }}
        />
    );
}
