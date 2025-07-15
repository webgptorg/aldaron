'use client';

import { usePathname } from 'next/navigation';
import ChatbotScript from './chatbot-script';

export default function ConditionalChatbot() {
    const pathname = usePathname();

    // Don't show chatbot on pricing-frame page
    if (pathname.startsWith('/pricing-frame')) {
        return null;
    }

    return <ChatbotScript />;
}
