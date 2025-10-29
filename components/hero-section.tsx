'use client';

import { Button } from '@/components/ui/button';
import defaultBook from '@/config/_generic/default.book';
import { useOptionalGetParam } from '@/hooks/useOptionalGetParam';
import { useYou } from '@/hooks/useYou';
import { BookEditor, LlmChat, useSendMessageToLlmChat } from '@promptbook/components';
import { createAgentLlmExecutionTools, parseAgentSource } from '@promptbook/core';
import { RemoteLlmExecutionTools } from '@promptbook/remote-client';
import type { string_book } from '@promptbook/types';
import { spaceTrim } from '@promptbook/utils';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type HeroSectionProps = {
    initialBook?: string_book;
};

export function HeroSection(props: HeroSectionProps) {
    const { initialBook } = props;

    const you = useYou();

    const initialBookDefined = initialBook || defaultBook;

    const [bookSource, setBookSource] = useOptionalGetParam<string_book>('book', () => initialBookDefined);

    const bookSourceDefined = bookSource || initialBookDefined;

    const [isInitialWelcomeVisible, setInitialWelcomeVisible] = useState(true);

    const llmTools = useMemo(() => {
        // new MockedFackedLlmExecutionTools();

        const baseLlmTools = new RemoteLlmExecutionTools({
            remoteServerUrl: 'https://promptbook.s5.ptbk.io/',
            identification: {
                isAnonymous: false,
                appId: '20a65fee-59f6-4d05-acd0-8e5ae8345488', // <- TODO: !!! Change to the new landing page app ID
            },
        });

        const agentLlmTools = createAgentLlmExecutionTools({
            llmTools: baseLlmTools,
            agentSource: bookSourceDefined,
        });

        return agentLlmTools;
    }, [bookSourceDefined]);

    const parsedAgent = useMemo(() => {
        return parseAgentSource(bookSourceDefined);
    }, [bookSourceDefined]);

    const sendMessage = useSendMessageToLlmChat();

    return (
        <>
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-16">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-purple rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-green rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                        {/* Left Column - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8 lg:col-span-3"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                                    <BookOpen className="w-4 h-4" />
                                    AI Transformation for Your Business
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    Create AI that{' '}
                                    <span className="bg-gradient-promptbook-dark bg-clip-text text-transparent">
                                        Truly&nbsp;Understand
                                    </span>{' '}
                                    {you || <>Your Company</>}
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    With Promptbook, you can capture your company's context, rules, and knowledge into
                                    simple <b>Books</b> to build AI agents that align perfectly with your business
                                    needs.
                                </p>
                            </div>

                            <br />
                            <Link href="?modal=get-started">
                                <Button
                                    size="lg"
                                    className="bg-promptbook-blue-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                                >
                                    Get Started {you ? <>with AI in {you}</> : <>with Promptbook AI</>}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>

                            <div className="flex items-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Open Source
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Your Data, Your Control
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Easy Setup
                                </div>
                            </div>

                            {/* Powered by Promptbook */}
                            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/promptbook-logo-blue-256.png" alt="Promptbook" className="w-6 h-6" />
                                <div className="text-sm">
                                    <span className="text-gray-600">Powered by </span>
                                    <Link
                                        href="https://www.ptbk.io"
                                        className="font-semibold text-promptbook-blue hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Promptbook
                                    </Link>
                                    <span className="text-gray-500 ml-2">• Truly Your AI{you && <>, {you}</>}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Book Example */}
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <BookEditor
                                value={bookSource || undefined}
                                onChange={setBookSource}
                                isDownloadButtonShown={false}
                                isAboutButtonShown={false}
                                className="lg:h-[600px] h-[400px] border border-gray-300 shadow-lg"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto py-24">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Try it yourself</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Try chatting with {parsedAgent.agentName} yourself:
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Book editor column: ensure full-height and prevent overflow */}
                    <div className="lg:col-span-1 h-[400px] lg:h-[600px] min-h-0 flex flex-col overflow-hidden">
                        <BookEditor
                            className="h-full min-h-0"
                            value={bookSource || undefined}
                            onChange={setBookSource}
                            isDownloadButtonShown={false}
                            isAboutButtonShown={false}
                        />
                    </div>

                    {/* Chat column: ensure full-height and allow internal scrolling */}
                    <div className="lg:col-span-1 h-[600px] min-h-0 flex flex-col overflow-hidden">
                        <LlmChat
                            className="h-full min-h-0"
                            title={'Chat with Pavol Hejný'}
                            persistenceKey="chat-with-pavol-hejny"
                            isSaveButtonEnabled={false}
                            isFocusedOnLoad={false}
                            userParticipantName="USER"
                            llmParticipantName="AVATAR"
                            initialMessages={[
                                {
                                    from: 'USER',
                                    content: spaceTrim(`
                                        Can you help me?
                                    `),
                                    isComplete: true,
                                },
                                {
                                    from: 'AVATAR',
                                    content: spaceTrim(`
                                        I'm the company's lawyer from ${parsedAgent.agentName}.
                                        I provide legal advice and support to the company and its employees, focusing on compliance with laws and company policies. How can I help?

                                        [Tell me more](?message=Tell me more)
                                    `),
                                    isComplete: true,
                                },
                            ]}
                            participants={[
                                {
                                    name: 'AVATAR',
                                    fullname: 'Pavol Hejný',
                                    avatarSrc:
                                        'https://www.pavolhejny.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpavol-hejny-transparent.56d4a7a5.png&w=1080&q=100',
                                    color: '#79EAFD',
                                    isMe: false,
                                    agentSource: bookSource || undefined,
                                },
                                // <- TODO: !!! Create chat participant from `bookSource`
                                {
                                    name: 'USER',
                                    fullname: 'User',
                                    color: '#115EB6',
                                    isMe: true,
                                },
                            ]}
                            // <- TODO: !!! Auto create chat participant from `llmTools` when `llmParticipantName` not defined
                            {...{ llmTools, sendMessage }}
                            onChange={(chatMessages) => {
                                setInitialWelcomeVisible(chatMessages.length === 0);
                            }}
                        >
                            {false && isInitialWelcomeVisible && (
                                <div className="h-full w-full">
                                    <div className="persona-container bg-black/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[var(--accent)] max-w-2xl w-full mx-4 sm:mx-auto pointer-events-auto flex flex-col items-center">
                                        <img
                                            src="https://www.pavolhejny.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpavol-hejny-transparent.56d4a7a5.png&w=1080&q=100"
                                            alt="Pavol Hejný"
                                            className="persona-photo"
                                        />
                                        <h1 className="persona-title text-3xl md:text-4xl font-bold text-white mb-3 text-center">
                                            Hi! I'm Pavol
                                        </h1>
                                        <p className="persona-subtitle text-gray-300 text-base md:text-lg leading-relaxed text-center max-w-xl">
                                            Welcome to my AI-powered workspace. I'm here to help transform your business
                                            with practical AI integration. Ask me about workshops, pricing,
                                            implementation strategies, or anything else you're curious about.
                                        </p>
                                        <div className="persona-buttons">
                                            <button
                                                type="button"
                                                className="persona-button"
                                                onClick={() => void sendMessage('Tell me about your workshops!')}
                                            >
                                                Workshop Design
                                            </button>
                                            <button
                                                type="button"
                                                className="persona-button"
                                                onClick={() => void sendMessage('Tell me about your AI strategy!')}
                                            >
                                                AI Strategy
                                            </button>
                                            <button
                                                type="button"
                                                className="persona-button"
                                                onClick={() => void sendMessage('Tell me about your team training!')}
                                            >
                                                Team Training
                                            </button>
                                            <button
                                                type="button"
                                                className="persona-button"
                                                onClick={() =>
                                                    void sendMessage('Tell me about your implementation process!')
                                                }
                                            >
                                                Implementation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </LlmChat>
                    </div>
                </div>
            </section>
        </>
    );
}
