'use client';

import { TODO_any } from '@promptbook/types';
import dynamic from 'next/dynamic';

const PromptbookMarkdownContent = dynamic(
    () => import('@promptbook/components').then((module) => module.MarkdownContent),
    { ssr: false },
);

export function MarkdownContent(props: Record<string, unknown>) {
    return <PromptbookMarkdownContent {...(props as TODO_any)} />;
}
