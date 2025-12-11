'use client';

import { PromptbookAgentIntegration } from '@promptbook/components';
import { useEffect } from 'react';

export function Chatbot() {
    useEffect(() => {
        console.log('Chatbot component mounted');
    });

    return (
        <>
            <PromptbookAgentIntegration
                agentUrl="https://landing-pages.ptbk.io/agents/benjamin-green"
                meta={{
                    image: 'https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/f9/e590c/pavol-hejny-transparent-3.png',
                    color: `#ffff00`,
                    // !!!! + Make one place
                }}
            />
        </>
    );
}

/**
 * TODO: !!! [🌆] Make PromptbookAgent working better
 */
