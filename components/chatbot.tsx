'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const PromptbookAgentIntegration = dynamic(
    () => import('@promptbook/components').then((module) => module.PromptbookAgentIntegration),
    { ssr: false },
);

export function Chatbot() {
    useEffect(() => {
        console.log('Chatbot component mounted');
    });

    return (
        <>
            <PromptbookAgentIntegration
                agentUrl="https://landing-pages.ptbk.io/agents/benjamin-green"
                meta={{
                    title: 'Benjamin Green !!!!!',

                    image: 'https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/f9/e590c/pavol-hejny-transparent-3.png',
                    color: `#30A8BD`,
                    // !!!! + Make one place
                }}
            />
        </>
    );
}
