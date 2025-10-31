export interface ConversationParticipant {
    name: string;
    fullname: string;
    color: string;
    personality: string;
    avatar: string;
    isMe?: boolean;
}

export interface ConversationMessage {
    author: string;
    content: string;
    timestamp: string;
}

export interface Conversation {
    title: string;
    description: string;
    participants: ConversationParticipant[];
    messages: ConversationMessage[];
}

import * as yaml from 'js-yaml';

// Configuration for all available conversations
const CONVERSATION_CONFIG = [
    { id: 'ai-healthcare-future', file: 'ai-healthcare-future.yaml' },
    { id: 'ai-healthcare-future-copy', file: 'ai-healthcare-future-copy.yaml' },
    { id: 'ai-consciousness-soul', file: 'ai-consciousness-soul.yaml' },
    { id: 'vibecoding-debate', file: 'vibecoding-debate.yaml' },
] as const;

// Dynamic imports for YAML files
async function loadConversationData(): Promise<Record<string, Conversation>> {
    const conversations: Record<string, Conversation> = {};

    try {
        // Dynamically import all conversation files
        const importPromises = CONVERSATION_CONFIG.map(async (config) => {
            try {
                const module = await import(`../conversations/${config.file}`);
                return { id: config.id, content: yaml.load(module.default) as Conversation };
            } catch (error) {
                console.error(`Failed to load conversation ${config.id}:`, error);
                return null;
            }
        });

        const results = await Promise.all(importPromises);

        // Add successfully loaded conversations to the map
        results.forEach((result) => {
            if (result) {
                conversations[result.id] = result.content;
            }
        });

        return conversations;
    } catch (error) {
        console.error('Error loading conversation data:', error);
        return {};
    }
}

// Cache for loaded conversations
let conversationsCache: Record<string, Conversation> | null = null;

// Get all conversations data
export async function getConversationsData(): Promise<Record<string, Conversation>> {
    if (conversationsCache) {
        return conversationsCache;
    }

    conversationsCache = await loadConversationData();
    return conversationsCache;
}

// Available conversation IDs (generated from config)
export const AVAILABLE_CONVERSATIONS: string[] = CONVERSATION_CONFIG.map((config) => config.id);

export type ConversationId = (typeof AVAILABLE_CONVERSATIONS)[number];

// Get conversation data
export async function getConversation(id: ConversationId): Promise<Conversation> {
    const conversations = await getConversationsData();
    const conversation = conversations[id];

    if (!conversation) {
        throw new Error(`Conversation with id "${id}" not found`);
    }

    return conversation;
}

// Synchronous version for backward compatibility (loads from cache)
export function getConversationSync(id: ConversationId): Conversation {
    if (!conversationsCache) {
        throw new Error('Conversations not loaded yet. Call getConversationsData() first.');
    }

    const conversation = conversationsCache[id];
    if (!conversation) {
        throw new Error(`Conversation with id "${id}" not found`);
    }

    return conversation;
}

// Convert conversation to Chat component format
export function convertToChat(conversation: Conversation) {
    // Create participants map for Chat component
    const participants = conversation.participants.map((p) => ({
        name: p.name,
        isMe: p.isMe || false,
        fullname: p.fullname,
        color: p.color,
        avatar: p.avatar,
    }));

    // Convert messages to Chat component format
    const messages = conversation.messages.map((msg) => ({
        id: `${msg.author}-${msg.timestamp}`,
        author: msg.author,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
    }));

    return {
        participants,
        messages,
        title: conversation.title,
        description: conversation.description,
    };
}

// Clear cache (useful for development/testing)
export function clearConversationsCache(): void {
    conversationsCache = null;
}

// For backward compatibility, export the dynamic data as CONVERSATIONS_DATA
// This will be a proxy that loads data asynchronously
export const CONVERSATIONS_DATA = new Proxy({} as Record<string, Conversation>, {
    get(target, prop: string) {
        if (!conversationsCache) {
            throw new Error('Conversations not loaded yet. Call getConversationsData() first.');
        }
        return conversationsCache[prop];
    },
    ownKeys(target) {
        if (!conversationsCache) {
            return [];
        }
        return Object.keys(conversationsCache);
    },
    has(target, prop: string) {
        if (!conversationsCache) {
            return false;
        }
        return prop in conversationsCache;
    },
    getOwnPropertyDescriptor(target, prop: string) {
        if (!conversationsCache || !(prop in conversationsCache)) {
            return undefined;
        }
        return {
            enumerable: true,
            configurable: true,
            value: conversationsCache[prop],
        };
    },
});
