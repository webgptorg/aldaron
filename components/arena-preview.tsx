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
import { useEffect, useState, useRef, useCallback } from 'react';

interface ConversationState {
    visibleMessages: any[];
    currentIndex: number;
    isPlaying: boolean;
    timeoutId?: NodeJS.Timeout;
}

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for managing real-time message display for each conversation
    const [conversationStates, setConversationStates] = useState<Record<string, ConversationState>>({});
    const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
    const isVisibleRef = useRef(true);

    // Handle visibility change (tab switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;

            if (document.hidden) {
                // Page is hidden, pause all conversations
                Object.keys(timeoutRefs.current).forEach(conversationId => {
                    if (timeoutRefs.current[conversationId]) {
                        clearTimeout(timeoutRefs.current[conversationId]);
                        delete timeoutRefs.current[conversationId];
                    }
                });
            } else {
                // Page is visible again, resume current conversation
                // We'll handle resuming in the conversation effect
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // Clean up all timeouts
            Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    // Function to get random delay between 1-3 seconds
    const getRandomDelay = () => Math.random() * 2000 + 1000; // 1000-3000ms

    // Function to schedule the next message
    const scheduleNextMessage = useCallback((conversationId: string) => {
        if (!isVisibleRef.current) return; // Don't schedule if page is hidden

        setConversationStates(prev => {
            const state = prev[conversationId];
            const conversation = conversations.find(c => c?.id === conversationId);

            if (!conversation || !state || !state.isPlaying) return prev;

            if (state.currentIndex >= conversation.messages.length) {
                // All messages shown, stop playing
                return {
                    ...prev,
                    [conversationId]: { ...state, isPlaying: false }
                };
            }

            const delay = state.currentIndex === 0 ? 1000 : getRandomDelay(); // First message after 1s, others random

            const timeoutId = setTimeout(() => {
                if (!isVisibleRef.current) return; // Double check visibility

                setConversationStates(current => {
                    const currentState = current[conversationId];
                    if (!currentState || !currentState.isPlaying) return current;

                    const nextMessage = conversation.messages[currentState.currentIndex];
                    const newState = {
                        ...current,
                        [conversationId]: {
                            ...currentState,
                            visibleMessages: [...currentState.visibleMessages, nextMessage],
                            currentIndex: currentState.currentIndex + 1
                        }
                    };

                    // Schedule next message
                    setTimeout(() => {
                        const updatedConversation = conversations.find(c => c?.id === conversationId);
                        const updatedState = newState[conversationId];
                        if (updatedConversation && updatedState && updatedState.isPlaying && updatedState.currentIndex < updatedConversation.messages.length) {
                            scheduleNextMessage(conversationId);
                        }
                    }, 50);

                    return newState;
                });

                delete timeoutRefs.current[conversationId];
            }, delay);

            timeoutRefs.current[conversationId] = timeoutId;
            return prev;
        });
    }, [conversations]);

    // Initialize conversation state when conversations are loaded
    useEffect(() => {
        if (conversations.length > 0) {
            const initialStates: Record<string, ConversationState> = {};
            conversations.forEach(conversation => {
                if (conversation) {
                    initialStates[conversation.id] = {
                        visibleMessages: [],
                        currentIndex: 0,
                        isPlaying: false
                    };
                }
            });
            setConversationStates(initialStates);
        }
    }, [conversations]);

    // Start conversation when selected conversation changes
    useEffect(() => {
        if (conversations.length === 0) return;

        // Clear any existing timeout for the previous conversation
        Object.keys(timeoutRefs.current).forEach(conversationId => {
            if (timeoutRefs.current[conversationId]) {
                clearTimeout(timeoutRefs.current[conversationId]);
                delete timeoutRefs.current[conversationId];
            }
        });

        // Reset and start the selected conversation
        setConversationStates(prev => {
            const newStates = { ...prev };

            // Reset all conversations to not playing
            Object.keys(newStates).forEach(id => {
                if (newStates[id]) {
                    newStates[id] = { ...newStates[id], isPlaying: false };
                }
            });

            // Start the selected conversation from the beginning
            if (newStates[selectedConversation]) {
                newStates[selectedConversation] = {
                    visibleMessages: [],
                    currentIndex: 0,
                    isPlaying: true
                };
            }

            return newStates;
        });

        // Start playing the selected conversation
        setTimeout(() => scheduleNextMessage(selectedConversation), 100);
    }, [selectedConversation, conversations]);

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

    const getCurrentConversationWithVisibleMessages = () => {
        const conversation = conversations.find((c) => c?.id === selectedConversation);
        const state = conversationStates[selectedConversation];

        if (!conversation || !state) return null;

        return {
            ...conversation,
            messages: state.visibleMessages
        };
    };

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

                    {AVAILABLE_CONVERSATIONS.map((conversationId) => {
                        const currentConversation = getCurrentConversationWithVisibleMessages();
                        const isCurrentTab = conversationId === selectedConversation;

                        return (
                            <TabsContent key={conversationId} value={conversationId} className="mt-6">
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {isCurrentTab && currentConversation ? (
                                        <Chat
                                            participants={currentConversation.participants
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
                                            messages={currentConversation.messages.map((msg: any) => ({
                                                id: msg.id,
                                                from: msg.author,
                                                content: msg.content,
                                                date: msg.timestamp,
                                            }))}
                                            isFocusedOnLoad={false}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-32 text-gray-500">
                                            {conversationStates[conversationId]?.visibleMessages.length === 0 ?
                                                "Discussion will start when you select this tab..." :
                                                "Switch to this tab to see the discussion"
                                            }
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        );
                    })}
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
