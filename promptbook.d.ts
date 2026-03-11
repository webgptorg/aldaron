declare module '@promptbook/types' {
    export type string_book = string;
}

declare module '@promptbook/utils' {
    export const titleToName: (value: string) => string;
}

declare module '@promptbook/components' {
    import { ComponentType } from 'react';

    export const AboutPromptbookInformation: ComponentType<any>;
    export const BookEditor: ComponentType<any>;
    export const MarkdownContent: ComponentType<any>;
    export const MockedChat: ComponentType<any>;
    export const PromptbookAgentIntegration: ComponentType<any>;
    export const PromptbookQrCode: ComponentType<any>;
}

// Note: [📖] Allow books to be imported:
declare module '*.book' {
    const content: import('@promptbook/types').string_book;
    export default content;
}

/*
TODO: [🧵]
declare module '@books/*' {
    const content: string_book;
    export default content;
}

*/
