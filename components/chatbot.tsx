'use client';

import { PromptbookAgent } from '@promptbook/components';
import { useEffect } from 'react';

export function Chatbot() {
    useEffect(() => {
        console.log('Chatbot component mounted');
    });

    return (
        <>
            <PromptbookAgent
                agentUrl="https://s6.ptbk.io/pavol-hejny"
                meta={{
                    image: 'https://collboard.fra1.cdn.digitaloceanspaces.com/ptbk-agents/user/files/f9/e590c/pavol-hejny-transparent-3.png',
                    color: `#ffff00`,
                    // < TODO: !!!!
                }}
            />
        </>
    );
}

/**
 * TODO: !!! [🌆] Make PromptbookAgent working better
 */
