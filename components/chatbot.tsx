'use client';

import { PromptbookAgent } from '@promptbook/components';
import { useEffect } from 'react';

export function Chatbot() {
    useEffect(() => {
        console.log('Chatbot component mounted');
    });

    return (
        <>
            xxx
            <PromptbookAgent agentUrl="https://s6.ptbk.io/pavol-hejny" />
        </>
    );
}
