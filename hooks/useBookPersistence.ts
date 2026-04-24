import type { string_book } from '@promptbook/types';
import { useEffect, useState } from 'react';

interface UseBookPersistenceOptions {
    storageKey: string;
    defaultBook: string_book;
}

export function useBookPersistence({ storageKey, defaultBook }: UseBookPersistenceOptions) {
    const [book, setBook] = useState<string_book>(defaultBook);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted book on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                try {
                    // Try parse in case the value was stored as JSON
                    const parsed = JSON.parse(raw);
                    setBook(parsed as string_book);
                } catch {
                    // Plain string
                    setBook(raw as string_book);
                }
            }
        } catch (e) {
            // Ignore localStorage errors (privacy mode, etc.)
            console.warn(`Failed to load book from localStorage for key: ${storageKey}`, e);
        } finally {
            setIsLoaded(true);
        }
    }, [storageKey]);

    // Persist book whenever it changes (but only after initial load)
    useEffect(() => {
        if (!isLoaded) return;

        try {
            if (typeof book === 'string') {
                localStorage.setItem(storageKey, book);
            } else {
                localStorage.setItem(storageKey, JSON.stringify(book));
            }
        } catch (e) {
            // Ignore write errors
            console.warn(`Failed to save book to localStorage for key: ${storageKey}`, e);
        }
    }, [book, storageKey, isLoaded]);

    const resetBook = () => {
        setBook(defaultBook);
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            console.warn(`Failed to remove book from localStorage for key: ${storageKey}`, e);
        }
    };

    return {
        book,
        setBook,
        resetBook,
        isLoaded
    };
}
