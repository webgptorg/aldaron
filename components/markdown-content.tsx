'use client';

import { MarkdownContent as PromptbookMarkdownContent } from '@promptbook/components';
import { ComponentProps } from 'react';

export function MarkdownContent(props: ComponentProps<typeof PromptbookMarkdownContent>) {
    return <PromptbookMarkdownContent {...props} />;
}
