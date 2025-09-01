'use client';

import { BookEditor, Chat } from '@promptbook/components';
import { motion } from 'framer-motion';
import { useBookPersistence } from '../hooks/use-book-persistence';
import { useSelectedAgent } from '../hooks/use-selected-agent';
import { BOOK_AGENTS } from '../lib/book-registry';
import { AvatarChipManager } from './avatar-chip-manager';

export function AvatarBookSection() {
    const { selectedAgent, selectAgent, isLoaded: agentLoaded } = useSelectedAgent();
    const {
        book,
        setBook,
        isLoaded: bookLoaded,
    } = useBookPersistence({
        storageKey: `avatar_book_${selectedAgent.id}`,
        defaultBook: selectedAgent.book,
    });

    // Don't render until both agent and book are loaded
    if (!agentLoaded || !bookLoaded) {
        return (
            <section id="integrations" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded mb-4 max-w-2xl mx-auto"></div>
                            <div className="h-6 bg-gray-200 rounded max-w-3xl mx-auto"></div>
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                        <div className="flex gap-4 justify-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 w-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

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

                <div className="space-y-8">
                    {/* Book Editor for the selected agent */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Editing: {selectedAgent.name}</h3>
                            <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                        </div>
                        <BookEditor value={book} onChange={setBook} isVerbose={false} />
                    </div>

                    {/* Agent Selection */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your AI Agent</h3>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {BOOK_AGENTS.map((agent) => (
                                <AvatarChipManager
                                    key={agent.id}
                                    agent={agent}
                                    isSelected={selectedAgent.id === agent.id}
                                    onSelect={() => selectAgent(agent)}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Click on any agent to switch and customize their personality
                        </p>
                    </div>

                    {/* Agent Selection */}
                    <div className="text-center">
                        <Chat
                            messages={[
                                {
                                    id: '1',
                                    from: 'avatar',
                                    date: new Date('2023-03-01T10:00:00Z'),
                                    isComplete: true,
                                    content: 'Hello! How can I help you today?',
                                },
                                {
                                    id: '2',
                                    from: 'user',
                                    date: new Date('2023-03-01T10:00:00Z'),
                                    isComplete: true,
                                    content: 'Can you tell me about your features?',
                                },
                            ]}
                            onMessage={(msg) => console.log('Mock message sent:', msg)}
                            participants={[
                                { name: 'avatar', fullname: 'AI Avatar', avatarSrc: '', color: '#ff8800' },
                                {
                                    name: 'user',
                                    isMe: true,
                                    fullname: 'You',
                                    avatarSrc:
                                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                                    color: '#008866',
                                },
                            ]}
                            placeholderMessageContent="Write a message"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
