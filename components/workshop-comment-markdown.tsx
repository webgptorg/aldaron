import React, { type ReactNode } from 'react';

type WorkshopCommentMarkdownProps = {
    readonly content: string;
    readonly className?: string;
};

const BASIC_MARKDOWN_TOKEN_PATTERN = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function createBasicMarkdownNode(token: string, key: string): ReactNode {
    if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={key}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('__') && token.endsWith('__')) {
        return <u key={key}>{token.slice(2, -2)}</u>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
        return (
            <code key={key} className="rounded bg-black/15 px-1 py-0.5 font-mono text-[0.9em]">
                {token.slice(1, -1)}
            </code>
        );
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
        return <em key={key}>{token.slice(1, -1)}</em>;
    }

    return token;
}

function renderBasicMarkdown(content: string): readonly ReactNode[] {
    const nodes: ReactNode[] = [];
    let currentIndex = 0;
    BASIC_MARKDOWN_TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = BASIC_MARKDOWN_TOKEN_PATTERN.exec(content)) !== null) {
        const matchedToken = match[0];
        const matchIndex = match.index;
        if (matchIndex > currentIndex) {
            nodes.push(content.slice(currentIndex, matchIndex));
        }
        nodes.push(createBasicMarkdownNode(matchedToken, `markdown-${matchIndex}`));
        currentIndex = matchIndex + matchedToken.length;
    }

    if (currentIndex < content.length) {
        nodes.push(content.slice(currentIndex));
    }

    return nodes;
}

/**
 * A deliberately small, safe Markdown subset for chat messages. It renders
 * only textual inline formatting, so images, links, HTML, and embeds remain
 * inert text instead of becoming executable or remote content.
 */
export function WorkshopCommentMarkdown({ content, className }: WorkshopCommentMarkdownProps) {
    return <div className={className}>{renderBasicMarkdown(content)}</div>;
}
