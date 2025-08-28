//import type { string_book } from '@promptbook/types';

// Note: [📖] Allow books to be imported:
declare module '*.book' {
    const content: string_book;
    export default content;
}

/*
TODO: [🧵]
declare module '@books/*' {
    const content: string_book;
    export default content;
}

*/
