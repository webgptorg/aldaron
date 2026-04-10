'use client';

import { AvatarChipFromSource } from '@promptbook/components';
import { useBookPersistence } from '../hooks/use-book-persistence';
import type { BookAgent } from '../lib/book-registry';

interface AvatarChipManagerProps {
    agent: BookAgent;
    isSelected: boolean;
    onSelect: () => void;
}

export function AvatarChipManager({ agent, isSelected, onSelect }: AvatarChipManagerProps) {
    const { book, setBook, isLoaded } = useBookPersistence({
        storageKey: `avatar_book_${agent.id}`,
        defaultBook: agent.book
    });

    // Don't render until the book is loaded from localStorage
    if (!isLoaded) {
        return (
            <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div
            className={`cursor-pointer transition-all duration-200 ${
                isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                    : 'hover:scale-102 hover:shadow-md'
            }`}
            onClick={onSelect}
            title={`${agent.name} - ${agent.description}`}
        >
            <AvatarChipFromSource
                source={book}
                isTemplate={false}
                isSelected={isSelected}
            />
        </div>
    );
}
