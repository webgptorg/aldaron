'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AVAILABLE_CONVERSATIONS,
    convertToChat,
    getConversationsData,
    type ConversationId,
} from '@/lib/conversations-data';
import { MockedChat } from '@promptbook/components';
import { generatePlaceholderAgentProfileImageUrl } from '@promptbook/core';
import { MessageCircle, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ArenaPreview() {
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

                    {conversations.map(
                        (conversation) =>
                            conversation && (
                                <TabsContent key={conversation.id} value={conversation.id} className="mt-6">
                                    <div style={{ height: '400px', overflowY: 'auto' }}>
                                        <MockedChat
                                            participants={conversation.participants
                                                .filter((participant: any) => participant.name !== 'user')
                                                .map((participant: any) => ({
                                                    ...participant,
                                                    name: participant.name, // <- Note: [🕙] It's not the semantics of the chat component that bother me; it's the way messages are mixed up.
                                                    isMe: participant.isMe, // <- Note: [🕙] It's not the semantics of the chat component that bother me; it's the way messages are mixed up.
                                                    fullname: participant.fullname || participant.name,
                                                    color: participant.color || '#6B7280',
                                                    avatarSrc: generatePlaceholderAgentProfileImageUrl(
                                                        participant.name,
                                                    ),
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
