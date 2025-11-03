'use client';

import defaultBook from '@/config/_generic/default.book';
import { useOptionalGetParam } from '@/hooks/useOptionalGetParam';
import { BookEditor, LlmChat, useSendMessageToLlmChat } from '@promptbook/components';
import { createAgentLlmExecutionTools, filterModels, parseAgentSource } from '@promptbook/core';
import { createGoogleExecutionTools } from '@promptbook/google';
import { createOpenAiExecutionTools } from '@promptbook/openai';
import { RemoteLlmExecutionTools } from '@promptbook/remote-client';
import type { string_book } from '@promptbook/types';
import { spaceTrim } from '@promptbook/utils';
import { useMemo, useState } from 'react';

type TryItYourselfSectionProps = {
    initialBook?: string_book;
    tryItYourself?: string;
    tryChatting?: string;
    helpMessage?: string;
    welcomeMessage?: (agentName: string) => string;
};

export function TryItYourselfSection(props: TryItYourselfSectionProps) {
    const {
        initialBook,
        tryItYourself = 'Try it yourself',
        tryChatting = 'Try chatting with {agentName} yourself:',
        helpMessage = 'Can you help me?',
        welcomeMessage = (agentName: string) =>
            `I'm the company's lawyer from ${agentName}. I provide legal advice and support to the company and its employees, focusing on compliance with laws and company policies. How can I help?`,
    } = props;

    const initialBookDefined = initialBook || defaultBook;

    const [bookSource, setBookSource] = useOptionalGetParam<string_book>('book', () => initialBookDefined);

    const bookSourceDefined = bookSource || initialBookDefined;

    const [isInitialWelcomeVisible, setInitialWelcomeVisible] = useState(true);

    const llmTools = useMemo(() => {
        // new MockedFackedLlmExecutionTools();

        const remoteLlmExecutionTools = new RemoteLlmExecutionTools({
            remoteServerUrl: 'https://promptbook.s5.ptbk.io/',
            identification: {
                isAnonymous: false,
                appId: '20a65fee-59f6-4d05-acd0-8e5ae8345488', // <- TODO: !!! Change to the new landing page app ID
            },
        });

        const filteredRemoteLlmExecutionTools = filterModels(remoteLlmExecutionTools, (model) => {
            return model.modelName.startsWith('gemini-');
        });

        const openAiLlmExecutionTools = createOpenAiExecutionTools({
            apiKey: '...',
        });

        const googleLlmExecutionTools = createGoogleExecutionTools({
            apiKey: '...',
        });

        const agentLlmTools = createAgentLlmExecutionTools({
            llmTools: remoteLlmExecutionTools, // googleLlmExecutionTools, //filteredRemoteLlmExecutionTools,
            agentSource: bookSourceDefined,
        });

        return agentLlmTools;
    }, [bookSourceDefined]);

    const parsedAgent = useMemo(() => {
        return parseAgentSource(bookSourceDefined);
    }, [bookSourceDefined]);

    // Ensure we always have a non-null agent name for UI strings
    const agentName = parsedAgent.agentName || 'your agent';

    const sendMessage = useSendMessageToLlmChat();

    return (
        <section
            id="try-it-yourself"
            className="relative  mx-0 py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{tryItYourself}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{tryChatting.replace('{agentName}', agentName)}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Floating arrow between columns (hidden on mobile) */}
                <img
                    src="/misc/arrow.svg"
                    alt="Arrow pointing from book editor to chat"
                    style={{ zIndex: 10000 }}
                    className="hidden lg:block pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 md:w-40"
                />
                {/* Book editor column: ensure full-height and prevent overflow */}
                <div className="lg:col-span-1 min-h-0 flex flex-col overflow-hidden">
                    <BookEditor
                        className="h-full min-h-0"
                        value={bookSource || undefined}
                        onChange={(value) => setBookSource(value)}
                        isDownloadButtonShown={false}
                        isAboutButtonShown={false}
                        isFullscreenButtonShown={true}
                    />
                </div>

                {/* Chat column: ensure full-height and allow internal scrolling */}
                <div className="lg:col-span-1 min-h-0 flex flex-col overflow-hidden">
                    <LlmChat
                        className="h-full min-h-0"
                        style={{
                            backgroundImage: `url(/backgrounds/chat.svg)`,
                            borderRadius: 20,
                            overflow: 'hidden',
                        }}
                        title={`Chat with ${agentName}`}
                        persistenceKey="chat-on-landing-page"
                        isSaveButtonEnabled={false}
                        isFocusedOnLoad={false}
                        userParticipantName="USER"
                        llmParticipantName="AVATAR"
                        initialMessages={[
                            {
                                from: 'USER',
                                content: spaceTrim(helpMessage),
                                isComplete: true,
                            },
                            {
                                from: 'AVATAR',
                                content: spaceTrim(
                                    `${welcomeMessage(agentName)}\n\n[Tell me more](?message=Tell me more)`,
                                ),
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
                                        with practical AI integration. Ask me about workshops, pricing, implementation
                                        strategies, or anything else you're curious about.
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
    );
}
