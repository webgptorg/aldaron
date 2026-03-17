'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function CitiesCsChatbot() {
    return <></>;

    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/TODO_PRO_MESTA" // TODO: fill in real agent URL
            meta={{
                fullname: 'AI asistent pro města a obce',
                title: 'AI asistent pro města a obce',
                description:
                    'Pomáhá samosprávám pochopit, jak Promptbook může transformovat znalosti úřadu do AI agentů.',
                inputPlaceholder: 'Zeptejte se na přínosy pro vaše město, ceník nebo jak začít...',
            }}
        />
    );
}
