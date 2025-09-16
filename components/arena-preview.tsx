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

interface ConversationState {
    visibleMessageCount: number;
    isComplete: boolean;
    timeoutId?: NodeJS.Timeout;
}

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Track state for each conversation
    const [conversationStates, setConversationStates] = useState<Record<ConversationId, ConversationState>>({
        'ai-healthcare-future': { visibleMessageCount: 0, isComplete: false },
        'ai-consciousness-soul': { visibleMessageCount: 0, isComplete: false },
        'vibecoding-debate': { visibleMessageCount: 0, isComplete: false },
    });

    const timeoutRefs = useRef<Record<ConversationId, NodeJS.Timeout | null>>({
        'ai-healthcare-future': null,
        'ai-consciousness-soul': null,
        'vibecoding-debate': null,
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
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setLoading(false);
            }
        }

        loadConversations();
    }, []);

    // Function to get random delay
    const getRandomDelay = () => Math.random() * 10_000 + 1000; // 1000-3000ms

    // Function to show next message for a conversation
    const showNextMessage = useCallback(
        (conversationId: ConversationId) => {
            const conversation = conversations.find((c) => c?.id === conversationId);
            if (!conversation) return;

            setConversationStates((prev) => {
                const currentState = prev[conversationId];
                const totalMessages = conversation.messages.length;

                if (currentState.visibleMessageCount >= totalMessages) {
                    return prev; // Already complete
                }

                const newVisibleCount = currentState.visibleMessageCount + 1;
                const isComplete = newVisibleCount >= totalMessages;

                // Schedule next message if not complete
                if (!isComplete) {
                    const delay = newVisibleCount === 1 ? 1000 : getRandomDelay(); // First message after 1s, others random
                    const timeoutId = setTimeout(() => {
                        showNextMessage(conversationId);
                    }, delay);

                    // Clear previous timeout
                    if (timeoutRefs.current[conversationId]) {
                        clearTimeout(timeoutRefs.current[conversationId]!);
                    }
                    timeoutRefs.current[conversationId] = timeoutId;
                }

                return {
                    ...prev,
                    [conversationId]: {
                        visibleMessageCount: newVisibleCount,
                        isComplete,
                    },
                };
            });
        },
        [conversations],
    );

    // Function to start conversation from beginning
    const startConversation = useCallback(
        (conversationId: ConversationId) => {
            // Clear any existing timeout
            if (timeoutRefs.current[conversationId]) {
                clearTimeout(timeoutRefs.current[conversationId]!);
                timeoutRefs.current[conversationId] = null;
            }

            // Reset state
            setConversationStates((prev) => ({
                ...prev,
                [conversationId]: {
                    visibleMessageCount: 0,
                    isComplete: false,
                },
            }));

            // Start showing messages after 1 second
            const timeoutId = setTimeout(() => {
                showNextMessage(conversationId);
            }, 1000);

            timeoutRefs.current[conversationId] = timeoutId;
        },
        [showNextMessage],
    );

    // Handle tab switching
    useEffect(() => {
        const currentState = conversationStates[selectedConversation];

        // If conversation hasn't started or is complete, restart it
        if (currentState.visibleMessageCount === 0 || currentState.isComplete) {
            startConversation(selectedConversation);
        }
        // If conversation is in progress, continue from where it left off
        else if (!currentState.isComplete) {
            // Continue the conversation with next message
            const delay = getRandomDelay();
            const timeoutId = setTimeout(() => {
                showNextMessage(selectedConversation);
            }, delay);

            if (timeoutRefs.current[selectedConversation]) {
                clearTimeout(timeoutRefs.current[selectedConversation]!);
            }
            timeoutRefs.current[selectedConversation] = timeoutId;
        }

        // Cleanup function to clear timeout when switching away
        return () => {
            if (timeoutRefs.current[selectedConversation]) {
                clearTimeout(timeoutRefs.current[selectedConversation]!);
                timeoutRefs.current[selectedConversation] = null;
            }
        };
    }, [selectedConversation, startConversation, showNextMessage]);

    // Cleanup all timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach((timeout) => {
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
                                            messages={conversation.messages
                                                .slice(0, currentState?.visibleMessageCount || 0)
                                                .map((msg: any) => ({
                                                    id: msg.id,
                                                    from: msg.author,
                                                    content: msg.content,
                                                    date: msg.timestamp,
                                                }))}
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
