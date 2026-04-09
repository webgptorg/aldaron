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
                    'Pomáhá firmám pochopit, co AI Supervize obnáší, jaké jsou přínosy a jestli začít školením, workshopem nebo rovnou AI Supervizí.',
                inputPlaceholder: 'Zeptejte se na supervizi, ceník školení nebo termíny workshopu...',
            }}
        />
    );
}
