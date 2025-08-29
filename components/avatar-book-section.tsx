'use client';

import { AvatarChipFromSource, BookEditor } from '@promptbook/components';
//import { DEFAULT_BOOK } from '@promptbook/core';
import type { string_book } from '@promptbook/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// import pavolHejnyBook from '@books/pavol-hejny'; // <- Note: [📖] Importing book
// <- TODO: [🧵]
import pavolHejnyBook from '../books/pavol-hejny.book'; // <- Note: [📖] Importing book

// console.log('pavolHejnyBook', pavolHejnyBook);

export function AvatarBookSection() {
    const [book, setBook] = useState<string_book>(/*DEFAULT_BOOK*/ pavolHejnyBook);
    const STORAGE_KEY = 'avatar_book';

    // Load persisted book on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            try {
                // try parse in case the value was stored as JSON
                const parsed = JSON.parse(raw);
                setBook(parsed as string_book);
            } catch {
                // plain string
                setBook(raw as string_book);
            }
        } catch (e) {
            // ignore localStorage errors (privacy mode, etc.)
        }
    }, []);

    // Persist book whenever it changes
    useEffect(() => {
        try {
            if (typeof book === 'string') {
                localStorage.setItem(STORAGE_KEY, book);
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
            }
        } catch (e) {
            // ignore write errors
        }
    }, [book]);

    return (
        <section id="integrations" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Your Avatar, Your control
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        The <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">Soul</span> of
                        your AI agent is{' '}
                        <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">
                            written in the Book.
                        </span>
                    </motion.p>
                </div>

                <div className="">
                    <BookEditor value={book} onChange={setBook} isVerbose={false} />
                    <AvatarChipFromSource source={book} isTemplate={false} isSelected />
                    <AvatarChipFromSource source={book} isTemplate={false} />
                    <AvatarChipFromSource source={book} isTemplate={false} />
                </div>
            </div>
        </section>
    );
}
