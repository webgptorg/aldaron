'use client';

import { BookEditor } from '@promptbook/components';
import { DEFAULT_BOOK } from '@promptbook/core';
import type { string_book } from '@promptbook/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function AvatarBookSection() {
    const [book, setBook] = useState<string_book>(DEFAULT_BOOK);

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
                        Soul of your AI agent is written in the Book.
                    </motion.p>
                </div>

                <div className="">
                    <BookEditor value={book} onChange={setBook} isVerbose={false} />
                </div>
            </div>
        </section>
    );
}
