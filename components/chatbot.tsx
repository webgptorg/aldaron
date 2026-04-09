'use client';

import { GenericChatbot } from '@/config/_generic/genericChatbot';
import { AiSupervizeChatbot } from '@/config/ai-supervize/aiSupervizeChatbot';
import { ForAgroChatbot } from '@/config/for-agro/forAgroChatbot';
import { CitiesCsChatbot } from '@/config/pro-mesta/citiesCsChatbot';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ChatbotInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (searchParams.get('chatbot') === null) {
        return (
            <>
                {/* Note: [🕔] Chatbots embedded on page aren't working very well for now, so we are temporarly not showing them. */}
            </>
        );
    }

    if (pathname.startsWith('/pro-mesta')) {
        return <CitiesCsChatbot />;
    }

    if (pathname.startsWith('/for-agro')) {
        return <ForAgroChatbot />;
    }

    if (pathname.startsWith('/ai-supervize')) {
        return <AiSupervizeChatbot />;
    }

    return <GenericChatbot />;
}

export function Chatbot() {
    return (
        <Suspense>
            <ChatbotInner />
        </Suspense>
    );
}
