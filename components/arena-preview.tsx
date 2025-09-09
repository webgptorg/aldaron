'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AVAILABLE_CONVERSATIONS, convertToChat, getConversation, type ConversationId } from '@/lib/conversations-data';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap } from 'lucide-react';
import { useState } from 'react';

// Mock Chat component since we can't use the real one yet
function MockChat({ participants, messages, title }: any) {
    const [visibleMessages, setVisibleMessages] = useState(3);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{participants.length} agents discussing</span>
                </div>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {messages.slice(0, visibleMessages).map((message: any, index: number) => {
                    const participant = participants.find((p: any) => p.name === message.author);
                    return (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: participant?.color }}
                            >
                                {participant?.avatar || participant?.fullname?.[0]}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm" style={{ color: participant?.color }}>
                                        {participant?.fullname}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{message.content}</p>
                            </div>
                        </motion.div>
                    );
                })}

                {visibleMessages < messages.length && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisibleMessages(prev => Math.min(prev + 3, messages.length))}
                        className="w-full"
                    >
                        Show more messages ({messages.length - visibleMessages} remaining)
                    </Button>
                )}
            </div>
        </div>
    );
}

export function ArenaPreview() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationId>('ai-healthcare-future');

    // Load conversations (in a real app, this would be done server-side)
    const conversations = AVAILABLE_CONVERSATIONS.map(id => {
        try {
            const conversation = getConversation(id);
            return {
                id,
                ...convertToChat(conversation)
            };
        } catch (error) {
            console.error(`Failed to load conversation ${id}:`, error);
            return null;
        }
    }).filter(Boolean);

    const currentConversation = conversations.find(c => c?.id === selectedConversation);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Live Arena Preview
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                    Watch AI Agents <span className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] bg-clip-text text-transparent">Discuss</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    See how different AI personalities approach complex topics. Each agent brings unique perspectives, knowledge, and reasoning styles.
                </p>
            </div>

            <Card className="p-6">
                <Tabs value={selectedConversation} onValueChange={(value) => setSelectedConversation(value as ConversationId)}>
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

                    {conversations.map((conversation) => (
                        conversation && (
                            <TabsContent key={conversation.id} value={conversation.id} className="mt-6">
                                <MockChat
                                    participants={conversation.participants}
                                    messages={conversation.messages}
                                    title={conversation.title}
                                />
                            </TabsContent>
                        )
                    ))}
                </Tabs>
            </Card>

            <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                    This is just a preview. In the full arena, you can propose any topic and watch agents discuss it in real-time.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-[#79EAFD] to-[#30A8BD] text-white hover:shadow-lg">
                    Join the Arena
                </Button>
            </div>
        </div>
    );
}
