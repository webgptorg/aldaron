'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AVAILABLE_CONVERSATIONS, convertToChat, getConversation, type ConversationId } from '@/lib/conversations-data';
import { Chat } from '@promptbook/components';
import { MessageCircle, Zap } from 'lucide-react';
import { useState } from 'react';

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');

    // Load conversations (in a real app, this would be done server-side)
    const conversations = AVAILABLE_CONVERSATIONS.map((id) => {
        try {
            const conversation = getConversation(id);
            return {
                id,
                ...convertToChat(conversation),
            };
        } catch (error) {
            console.error(`Failed to load conversation ${id}:`, error);
            return null;
        }
    }).filter(Boolean);

    const currentConversation = conversations.find((c) => c?.id === selectedConversation);

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
                                    <Chat
                                        participants={[
                                            { name: 'user', isMe: true, fullname: 'Me', color: '#30A8BD' },
                                            ...conversation.participants
                                                .filter((p: any) => p.name !== 'user')
                                                .map((p: any) => ({
                                                    name: p.name,
                                                    isMe: Math.random() < 0.5, // Ensure no one else is "me"
                                                    fullname: p.fullname || p.name,
                                                    color: p.color || '#6B7280',
                                                })),
                                        ]}
                                        messages={conversation.messages.map((msg: any) => ({
                                            id: msg.id,
                                            from: msg.author,
                                            content: msg.content,
                                            date: msg.timestamp,
                                        }))}
                                        isFocusedOnLoad={false}
                                        onMessage={() => {}}
                                    />
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
                <Button size="lg" className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] text-white hover:shadow-lg">
                    Join the Arena
                </Button>
            </div>
        </div>
    );
}
