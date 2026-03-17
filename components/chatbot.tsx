'use client';

import { GenericChatbot } from '@/config/_generic/genericChatbot';
import { AiSupervizeChatbot } from '@/config/ai-supervize/aiSupervizeChatbot';
import { CitiesCsChatbot } from '@/config/pro-mesta/citiesCsChatbot';
import { usePathname } from 'next/navigation';

export function Chatbot() {
    const pathname = usePathname();

    if (pathname.startsWith('/pro-mesta')) {
        return <CitiesCsChatbot />;
    }

    if (pathname.startsWith('/ai-supervize')) {
        return <AiSupervizeChatbot />;
    }

    return <GenericChatbot />;
}
