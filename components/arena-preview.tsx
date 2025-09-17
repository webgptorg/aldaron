'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AVAILABLE_CONVERSATIONS,
    convertToChat,
    getConversationsData,
    type ConversationId,
} from '@/lib/conversations-data';
import { Chat } from '@promptbook/components';
import { generatePlaceholderAgentProfileImageUrl } from '@promptbook/core';
import { MessageCircle, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface StreamingMessage {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    streamedContent: string;
    isStreaming: boolean;
    isComplete: boolean;
}

interface ConversationState {
    currentMessageIndex: number;
    messages: StreamingMessage[];
    isComplete: boolean;
    isThinking: boolean;
}

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Track state for each conversation
    const [conversationStates, setConversationStates] = useState<Record<ConversationId, ConversationState>>({
        'ai-healthcare-future': { currentMessageIndex: -1, messages: [], isComplete: false, isThinking: false },
        'ai-consciousness-soul': { currentMessageIndex: -1, messages: [], isComplete: false, isThinking: false },
        'vibecoding-debate': { currentMessageIndex: -1, messages: [], isComplete: false, isThinking: false },
    });

    const timeoutRefs = useRef<Record<ConversationId, NodeJS.Timeout | null>>({
        'ai-healthcare-future': null,
        'ai-consciousness-soul': null,
        'vibecoding-debate': null,
    });

    const streamingRefs = useRef<Record<ConversationId, NodeJS.Timeout | null>>({
        'ai-healthcare-future': null,
        'ai-consciousness-soul': null,
        'vibecoding-debate': null,
    });

    const hasStartedRef = useRef<Record<ConversationId, boolean>>({
        'ai-healthcare-future': false,
        'ai-consciousness-soul': false,
        'vibecoding-debate': false,
    });

    // Load conversations asynchronously
    useEffect(() => {
        async function loadConversations() {
            try {
                setLoading(true);
                const conversationsData = await getConversationsData();

                const loadedConversations = AVAILABLE_CONVERSATIONS.map((id) => {
                    try {
                        const conversation = conversationsData[id];
                        if (!conversation) {
                            console.error(`Conversation ${id} not found`);
                            return null;
                        }
                        return {
                            id,
                            ...convertToChat(conversation),
                        };
                    } catch (error) {
                        console.error(`Failed to load conversation ${id}:`, error);
                        return null;
                    }
                }).filter(Boolean);

                setConversations(loadedConversations);

                // Initialize conversation states with proper message structure
                const initialStates: Record<ConversationId, ConversationState> = {};
                AVAILABLE_CONVERSATIONS.forEach((id) => {
                    const conversation = loadedConversations.find(c => c?.id === id);
                    if (conversation) {
                        const streamingMessages: StreamingMessage[] = conversation.messages.map((msg: any) => ({
                            id: msg.id,
                            author: msg.author,
                            content: msg.content,
                            timestamp: msg.timestamp,
                            streamedContent: '',
                            isStreaming: false,
                            isComplete: false,
                        }));

                        initialStates[id as ConversationId] = {
                            currentMessageIndex: -1,
                            messages: streamingMessages,
                            isComplete: false,
                            isThinking: false,
                        };
                    }
                });

                setConversationStates(initialStates);
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setLoading(false);
            }
        }

        loadConversations();
    }, []);

    // Utility functions for random delays
    const getWordDelay = () => Math.random() * 150 + 50; // 50-200ms
    const getThinkingDelay = () => Math.random() * 1000 + 500; // 500-1500ms
    const getDeepThinkingDelay = () => Math.random() * 5000; // 0-5000ms

    // Function to stream a single word
    const streamWord = useCallback((conversationId: ConversationId, messageIndex: number, words: string[], wordIndex: number) => {
        if (wordIndex >= words.length) {
            // Message complete, check for sentence ending and add deep thinking delay
            setConversationStates(prev => {
                const message = prev[conversationId]?.messages[messageIndex];
                if (message) {
                    const content = message.content;
                    const endsWithSentence = /[.!?]$/.test(content.trim());

                    // Schedule next message with appropriate delay
                    const delay = endsWithSentence ? getDeepThinkingDelay() + getThinkingDelay() : getThinkingDelay();

                    const timeoutId = setTimeout(() => {
                        startNextMessage(conversationId);
                    }, delay);

                    timeoutRefs.current[conversationId] = timeoutId;

                    return {
                        ...prev,
                        [conversationId]: {
                            ...prev[conversationId],
                            messages: prev[conversationId].messages.map((msg, idx) =>
                                idx === messageIndex
                                    ? { ...msg, isStreaming: false, isComplete: true }
                                    : msg
                            ),
                        }
                    };
                }
                return prev;
            });
            return;
        }

        // Add current word to streamed content
        setConversationStates(prev => ({
            ...prev,
            [conversationId]: {
                ...prev[conversationId],
                messages: prev[conversationId].messages.map((msg, idx) =>
                    idx === messageIndex
                        ? {
                            ...msg,
                            streamedContent: words.slice(0, wordIndex + 1).join(' '),
                            isStreaming: true
                        }
                        : msg
                ),
            }
        }));

        // Schedule next word
        const delay = getWordDelay();
        const timeoutId = setTimeout(() => {
            streamWord(conversationId, messageIndex, words, wordIndex + 1);
        }, delay);

        streamingRefs.current[conversationId] = timeoutId;
    }, []);

    // Function to start streaming the next message
    const startNextMessage = useCallback((conversationId: ConversationId) => {
        setConversationStates(prev => {
            const state = prev[conversationId];
            if (!state) return prev;

            const nextIndex = state.currentMessageIndex + 1;
            if (nextIndex >= state.messages.length) {
                // Conversation complete
                return {
                    ...prev,
                    [conversationId]: {
                        ...prev[conversationId],
                        isComplete: true,
                        isThinking: false,
                    }
                };
            }

            // Set thinking state and schedule streaming
            const thinkingDelay = getThinkingDelay();
            const timeoutId = setTimeout(() => {
                setConversationStates(prevInner => ({
                    ...prevInner,
                    [conversationId]: {
                        ...prevInner[conversationId],
                        isThinking: false,
                    }
                }));

                // Start streaming words
                const message = state.messages[nextIndex];
                if (message) {
                    const words = message.content.split(' ');
                    streamWord(conversationId, nextIndex, words, 0);
                }
            }, thinkingDelay);

            timeoutRefs.current[conversationId] = timeoutId;

            return {
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    currentMessageIndex: nextIndex,
                    isThinking: true,
                }
            };
        });
    }, [streamWord]);

    // Function to start conversation from beginning
    const startConversation = useCallback((conversationId: ConversationId) => {
        // Clear any existing timeouts
        if (timeoutRefs.current[conversationId]) {
            clearTimeout(timeoutRefs.current[conversationId]!);
            timeoutRefs.current[conversationId] = null;
        }
        if (streamingRefs.current[conversationId]) {
            clearTimeout(streamingRefs.current[conversationId]!);
            streamingRefs.current[conversationId] = null;
        }

        // Reset conversation state
        setConversationStates(prev => ({
            ...prev,
            [conversationId]: {
                ...prev[conversationId],
                currentMessageIndex: -1,
                isComplete: false,
                isThinking: false,
                messages: prev[conversationId].messages.map(msg => ({
                    ...msg,
                    streamedContent: '',
                    isStreaming: false,
                    isComplete: false,
                })),
            }
        }));

        // Start first message after a short delay
        const timeoutId = setTimeout(() => {
            startNextMessage(conversationId);
        }, 1000);

        timeoutRefs.current[conversationId] = timeoutId;
    }, [startNextMessage]);

    // Handle tab switching
    useEffect(() => {
        // Always start the conversation when switching tabs
        startConversation(selectedConversation);
        hasStartedRef.current[selectedConversation] = true;

        // Cleanup function to clear timeouts when switching away
        return () => {
            if (timeoutRefs.current[selectedConversation]) {
                clearTimeout(timeoutRefs.current[selectedConversation]!);
                timeoutRefs.current[selectedConversation] = null;
            }
            if (streamingRefs.current[selectedConversation]) {
                clearTimeout(streamingRefs.current[selectedConversation]!);
                streamingRefs.current[selectedConversation] = null;
            }
        };
    }, [selectedConversation, startConversation]);

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach((timeout) => {
                if (timeout) clearTimeout(timeout);
            });
            Object.values(streamingRefs.current).forEach((timeout) => {
                if (timeout) clearTimeout(timeout);
            });
        };
    }, []);

    const currentConversation = conversations.find((c) => c?.id === selectedConversation);
    const currentState = conversationStates[selectedConversation];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        Live Arena Preview
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Watch AI Agents{' '}
                        <span className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] bg-clip-text text-transparent">
                            Discuss
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">🔼 Agents are waking up...</p>
                </div>
            </div>
        );
    }

    // Prepare messages for Chat component
    const getDisplayMessages = () => {
        if (!currentState) return [];

        return currentState.messages
            .slice(0, currentState.currentMessageIndex + 1)
            .map((msg, index) => {
                // Show full content for completed messages
                if (index < currentState.currentMessageIndex) {
                    return {
                        id: msg.id,
                        from: msg.author,
                        content: msg.content,
                        date: msg.timestamp,
                    };
                }
                // Show streaming content for current message
                else if (index === currentState.currentMessageIndex) {
                    return {
                        id: msg.id,
                        from: msg.author,
                        content: msg.isStreaming ? msg.streamedContent : msg.content,
                        date: msg.timestamp,
                    };
                }
                // Don't show future messages
                return null;
            })
            .filter((msg): msg is NonNullable<typeof msg> => msg !== null && msg.content.length > 0);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Live Arena Preview
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                    Watch AI Agents{' '}
                    <span className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] bg-clip-text text-transparent">
                        Discuss
                    </span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    See how different AI personalities approach complex topics. Each agent brings unique perspectives,
                    knowledge, and reasoning styles.
                </p>
            </div>

            <Card className="p-6">
                <Tabs
                    value={selectedConversation}
                    onValueChange={(value) => setSelectedConversation(value as ConversationId)}
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ai-healthcare-future" className="text-xs">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Healthcare AI
                        </TabsTrigger>
                        <TabsTrigger value="ai-consciousness-soul" className="text-xs">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            AI Consciousness
                        </TabsTrigger>
                        <TabsTrigger value="vibecoding-debate" className="text-xs">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Vibecoding
                        </TabsTrigger>
                    </TabsList>

                    {conversations.map(
                        (conversation) =>
                            conversation && (
                                <TabsContent key={conversation.id} value={conversation.id} className="mt-6">
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <Chat
                                            participants={conversation.participants
                                                .filter((participant: any) => participant.name !== 'user')
                                                .map((participant: any) => ({
                                                    ...participant,
                                                    name: participant.name,
                                                    isMe: participant.isMe,
                                                    fullname: participant.fullname || participant.name,
                                                    color: participant.color || '#6B7280',
                                                    avatarSrc: generatePlaceholderAgentProfileImageUrl(
                                                        participant.name,
                                                    ),
                                                }))}
                                            messages={getDisplayMessages()}
                                            isFocusedOnLoad={false}
                                        />
                                        {currentState?.isThinking && (
                                            <div className="flex items-center gap-2 p-4 text-gray-500 text-sm">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span>Agent is thinking...</span>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            ),
                    )}
                </Tabs>
            </Card>

            <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                    This is just a preview. In the full arena, you can propose any topic and watch agents discuss it in
                    real-time.
                </p>
            </div>
        </div>
    );
}
