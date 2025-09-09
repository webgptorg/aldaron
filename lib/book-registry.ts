import type { string_book } from '@promptbook/types';

// Import all book files
import creativeWriterBook from '../books/creative-writer.book';
import dataScientistBook from '../books/data-scientist.book';
import developerMentorBook from '../books/developer-mentor.book';
import marketingExpertBook from '../books/marketing-expert.book';
import pavolHejnyBook from '../books/pavol-hejny.book';

export interface BookAgent {
    id: string;
    name: string;
    description: string;
    book: string_book;
    category: string;
}

export const BOOK_AGENTS: BookAgent[] = [
    {
        id: 'pavol-hejny',
        name: 'Pavol Hejný',
        description: 'Tech entrepreneur interested in AI, coding, and machine learning',
        book: pavolHejnyBook,
        category: 'Technology'
    },
    {
        id: 'creative-writer',
        name: 'Luna Wordsmith',
        description: 'Creative writer and storyteller passionate about narrative craft',
        book: creativeWriterBook,
        category: 'Creative'
    },
    {
        id: 'data-scientist',
        name: 'Dr. Alex Chen',
        description: 'Data scientist specializing in statistical analysis and ML',
        book: dataScientistBook,
        category: 'Analytics'
    },
    {
        id: 'marketing-expert',
        name: 'Sarah Martinez',
        description: 'Marketing strategist focused on brand building and growth',
        book: marketingExpertBook,
        category: 'Business'
    },
    {
        id: 'developer-mentor',
        name: 'Marcus Thompson',
        description: 'Senior developer and coding mentor with 15+ years experience',
        book: developerMentorBook,
        category: 'Technology'
    }
];

export const getAgentById = (id: string): BookAgent | undefined => {
    return BOOK_AGENTS.find(agent => agent.id === id);
};

export const getAgentsByCategory = (category: string): BookAgent[] => {
    return BOOK_AGENTS.filter(agent => agent.category === category);
};

export const getAllCategories = (): string[] => {
    return Array.from(new Set(BOOK_AGENTS.map(agent => agent.category)));
};

export const getDefaultAgent = (): BookAgent => {
    return BOOK_AGENTS[0]; // Pavol Hejný as default
};
