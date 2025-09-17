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
    fullContent: string;
    timestamp: Date;
    streamedContent: string;
    isStreaming: boolean;
    isComplete: boolean;
}

interface ConversationState {
    messages: StreamingMessage[];
    currentMessageIndex: number;
    isComplete: boolean;
    isThinking: boolean;
}

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Track state for each conversation
    const [conversationStates, setConversationStates] = useState<Record<ConversationId, ConversationState>>({
        'ai-healthcare-future': { messages: [], currentMessageIndex: -1, isComplete: false, isThinking: false },
        'ai-consciousness-soul': { messages: [], currentMessageIndex: -1, isComplete: false, isThinking: false },
        'vibecoding-debate': { messages: [], currentMessageIndex: -1, isComplete: false, isThinking: false },
    });

    const timeoutRefs = useRef<Record<ConversationId, NodeJS.Timeout[]>>({
        'ai-healthcare-future': [],
        'ai-consciousness-soul': [],
        'vibecoding-debate': [],
    });

    const conversationsRef = useRef<any[]>([]);

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

                conversationsRef.current = loadedConversations;
                setConversations(loadedConversations);
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

    // Clear all timeouts for a conversation
    const clearTimeouts = useCallback((conversationId: ConversationId) => {
        timeoutRefs.current[conversationId].forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current[conversationId] = [];
    }, []);

    // Stream a single word to a message
    const streamWord = useCallback((
        conversationId: ConversationId,
        messageIndex: number,
        words: string[],
        wordIndex: number
    ) => {
        if (wordIndex >= words.length) {
            // Message is complete
            setConversationStates(prev => ({
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    messages: prev[conversationId].messages.map((msg, idx) =>
                        idx === messageIndex
                            ? { ...msg, isStreaming: false, isComplete: true }
                            : msg
                    )
                }
            }));

            // Check if this was the last sentence and add deep thinking delay
            const currentWord = words[wordIndex - 1];
            const isEndOfSentence = currentWord && /[.!?]$/.test(currentWord);

            if (isEndOfSentence) {
                const deepThinkingDelay = getDeepThinkingDelay();
                const timeout = setTimeout(() => {
                    startNextMessage(conversationId);
                }, deepThinkingDelay);
                timeoutRefs.current[conversationId].push(timeout);
            } else {
                startNextMessage(conversationId);
            }
            return;
        }

        // Add the next word
        setConversationStates(prev => ({
            ...prev,
            [conversationId]: {
                ...prev[conversationId],
                messages: prev[conversationId].messages.map((msg, idx) =>
                    idx === messageIndex
                        ? {
                            ...msg,
                            streamedContent: words.slice(0, wordIndex + 1).join(' ')
                        }
                        : msg
                )
            }
        }));

        // Check if this word ends a sentence for deep thinking pause
        const currentWord = words[wordIndex];
        const isEndOfSentence = /[.!?]$/.test(currentWord);

        let nextDelay = getWordDelay();
        if (isEndOfSentence && wordIndex < words.length - 1) {
            nextDelay += getDeepThinkingDelay();
        }

        // Schedule next word
        const timeout = setTimeout(() => {
            streamWord(conversationId, messageIndex, words, wordIndex + 1);
        }, nextDelay);

        timeoutRefs.current[conversationId].push(timeout);
    }, [getWordDelay, getDeepThinkingDelay]);

    // Start streaming a message
    const startMessageStreaming = useCallback((
        conversationId: ConversationId,
        messageIndex: number
    ) => {
        setConversationStates(prev => {
            const state = prev[conversationId];
            const message = state.messages[messageIndex];

            if (!message) return prev;

            // Split content into words
            const words = message.fullContent.split(' ').filter(word => word.length > 0);

            // Mark message as streaming and start streaming words
            const newState = {
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    messages: prev[conversationId].messages.map((msg, idx) =>
                        idx === messageIndex
                            ? { ...msg, isStreaming: true, streamedContent: '' }
                            : msg
                    ),
                    isThinking: false
                }
            };

            // Start streaming words after state update
            setTimeout(() => {
                streamWord(conversationId, messageIndex, words, 0);
            }, 0);

            return newState;
        });
    }, [streamWord]);

    // Start the next message
    const startNextMessage = useCallback((conversationId: ConversationId) => {
        setConversationStates(prev => {
            const conversation = conversationsRef.current.find(c => c?.id === conversationId);
            if (!conversation) return prev;

            const state = prev[conversationId];
            const nextMessageIndex = state.currentMessageIndex + 1;

            if (nextMessageIndex >= conversation.messages.length) {
                // Conversation is complete
                return {
                    ...prev,
                    [conversationId]: {
                        ...prev[conversationId],
                        isComplete: true,
                        isThinking: false
                    }
                };
            }

            // Set thinking state and schedule message streaming
            const thinkingDelay = getThinkingDelay();
            const timeout = setTimeout(() => {
                startMessageStreaming(conversationId, nextMessageIndex);
            }, thinkingDelay);

            timeoutRefs.current[conversationId].push(timeout);

            return {
                ...prev,
                [conversationId]: {
                    ...prev[conversationId],
                    currentMessageIndex: nextMessageIndex,
                    isThinking: true
                }
            };
        });
    }, [startMessageStreaming, getThinkingDelay]);

    // Initialize conversation state
    const initializeConversation = useCallback((conversationId: ConversationId) => {
        const conversation = conversationsRef.current.find(c => c?.id === conversationId);
        if (!conversation) return;

        // Clear any existing timeouts
        clearTimeouts(conversationId);

        // Convert messages to streaming format
        const streamingMessages: StreamingMessage[] = conversation.messages.map((msg: any) => ({
            id: msg.id,
            author: msg.author,
            fullContent: msg.content,
            timestamp: msg.timestamp,
            streamedContent: '',
            isStreaming: false,
            isComplete: false
        }));

        // Reset state
        setConversationStates(prev => ({
            ...prev,
            [conversationId]: {
                messages: streamingMessages,
                currentMessageIndex: -1,
                isComplete: false,
                isThinking: false
            }
        }));

        // Start the first message after a brief delay
        const timeout = setTimeout(() => {
            startNextMessage(conversationId);
        }, 1000);

        timeoutRefs.current[conversationId].push(timeout);
    }, [clearTimeouts, startNextMessage]);

    // Handle tab switching
    useEffect(() => {
        if (conversations.length === 0) return;

        const currentState = conversationStates[selectedConversation];

        // If conversation hasn't started or is complete, restart it
        if (currentState.currentMessageIndex === -1 || currentState.isComplete) {
            initializeConversation(selectedConversation);
        }

        // Cleanup function to clear timeouts when switching away
        return () => {
            clearTimeouts(selectedConversation);
        };
    }, [selectedConversation, conversations.length, initializeConversation, clearTimeouts]);

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            Object.keys(timeoutRefs.current).forEach(conversationId => {
                clearTimeouts(conversationId as ConversationId);
            });
        };
    }, [clearTimeouts]);

    // Get current conversation and state
    const currentConversation = conversations.find((c) => c?.id === selectedConversation);
    const currentState = conversationStates[selectedConversation];

    // Prepare messages for Chat component
    const displayMessages = currentState?.messages
        .slice(0, currentState.currentMessageIndex + 1)
        .map(msg => ({
            id: msg.id,
            from: msg.author,
            content: msg.streamedContent || msg.fullContent,
            date: msg.timestamp,
        })) || [];

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
                                        {currentState?.isThinking && displayMessages.length > 0 && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 animate-pulse">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span>Thinking...</span>
                                            </div>
                                        )}
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
                                            messages={displayMessages}
                                            isFocusedOnLoad={false}
                                        />
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
