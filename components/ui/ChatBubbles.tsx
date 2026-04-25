'use client';
import { useEffect, useState } from 'react';
import { MarkdownContent } from '../markdown-content';

// Speed: ms per character
const CHAR_SPEED_USER = 25;
const CHAR_SPEED_BOT = 18;

export function TypewriterBubble({
    text,
    type,
    onComplete,
}: {
    text: string;
    type: 'user' | 'bot';
    onComplete: () => void;
}) {
    const [displayedText, setDisplayedText] = useState('');
    const charSpeed = type === 'user' ? CHAR_SPEED_USER : CHAR_SPEED_BOT;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayedText(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                onComplete();
            }
        }, charSpeed);
        return () => clearInterval(interval);
    }, [text, charSpeed, onComplete]);

    return (
        <div
            className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                type === 'user'
                    ? 'bg-red-100 text-gray-800 rounded-br-md'
                    : 'bg-promptbook-blue/20 text-gray-800 rounded-bl-md'
            }`}
        >
            <MarkdownContent content={displayedText} />
            <span className="inline-block w-[2px] h-[14px] bg-gray-400 ml-[1px] align-middle animate-pulse" />
        </div>
    );
}

export function CompletedBubble({ text, type }: { text: string; type: 'user' | 'bot' }) {
    return (
        <div
            className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                type === 'user'
                    ? 'bg-red-100 text-gray-800 rounded-br-md'
                    : 'bg-promptbook-blue/20 text-gray-800 rounded-bl-md'
            }`}
        >
            <MarkdownContent content={text} />
        </div>
    );
}
