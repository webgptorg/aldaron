'use client';

import dynamic from 'next/dynamic';

const PromptbookMarkdownContent = dynamic(
    () => import('@promptbook/components').then((module) => module.MarkdownContent),
    { ssr: false },
);

export function MarkdownContent(props: Record<string, unknown>) {
    return <PromptbookMarkdownContent {...props} />;
}
