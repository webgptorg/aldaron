'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
    AVAILABLE_CONVERSATIONS,
    convertToChat,
    getConversationsData,
    type ConversationId,
} from '@/lib/conversations-data';
import { MockedChat } from '@promptbook/components';
import { generatePlaceholderAgentProfileImageUrl } from '@promptbook/core';
import { useEffect, useState } from 'react';

export function MockedChatSection() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const currentConversation = conversations.find((c) => c?.id === selectedConversation);

    if (loading) {
        return (
            <div>
                <p>🔼 Agents are waking up...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                  display: none;
              }
              .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
              }
          `}</style>
            <Tabs
                value={selectedConversation}
                onValueChange={(value) => setSelectedConversation(value as ConversationId)}
            >
                {/*
            <TabsList
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${conversations.length}, minmax(0, 1fr))` }}
            >
                {conversations.map((conversation) => (
                    <TabsTrigger key={conversation.id} value={conversation.id} className="text-xs">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {conversation.title}
                    </TabsTrigger>
                ))}
            </TabsList>
            */}

                {conversations.map(
                    (conversation) =>
                        conversation && (
                            <TabsContent key={conversation.id} value={conversation.id}>
                                <div
                                    className="no-scrollbar lg:max-h-[90vh] max-h-none w-full"
                                    style={{ overflowY: 'auto' }}
                                >
                                    <MockedChat
                                        className="debug"
                                        title={conversation.title}
                                        isFocusedOnLoad={false}
                                        isSaveButtonEnabled={false}
                                        isCopyButtonEnabled={false}
                                        isResettable={false}
                                        isPausable={false}
                                        delayConfig={{
                                            showIntermediateMessages: 1,
                                        }}
                                        participants={conversation.participants
                                            .filter((participant: any) => participant.name !== 'user')
                                            .map((participant: any) => ({
                                                ...participant,
                                                name: participant.name,
                                                isMe: participant.isMe,
                                                fullname: participant.fullname || participant.name,
                                                color: participant.color || '#6B7280',
                                                avatarSrc: generatePlaceholderAgentProfileImageUrl(participant.name),
                                            }))}
                                        messages={conversation.messages.map((msg: any) => ({
                                            id: msg.id,
                                            from: msg.author,
                                            content: msg.content,
                                            date: msg.timestamp,
                                        }))}
                                    />
                                </div>
                            </TabsContent>
                        ),
                )}
            </Tabs>
        </>
    );
}
