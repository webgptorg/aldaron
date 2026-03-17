'use client';

import dynamic from 'next/dynamic';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function GenericChatbot() {
    return <></>;

    return (
        <PromptbookAgentIntegration
            agentUrl="https://landing-pages.ptbk.io/agents/sZ3jP5osQuxHJ7"
            meta={{
                fullname: 'Promptbook Website Assistant',
                title: 'Promptbook Website Assistant',
                description: 'Helps visitors understand Promptbook, compare plans, and choose the right next step.',
                inputPlaceholder: 'Ask about pricing, use cases, Book language, or how to get started...',
            }}
        />
    );
}
