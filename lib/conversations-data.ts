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

// Dynamic imports for YAML files
async function loadConversationData(): Promise<Record<string, Conversation>> {
    const conversations: Record<string, Conversation> = {};

    try {
        // Import YAML files dynamically as raw text
        const [
            aiHealthcareFutureRaw,
            aiConsciousnessSoulRaw,
            vibecodingDebateRaw
        ] = await Promise.all([
            import('../conversations/ai-healthcare-future.yaml'),
            import('../conversations/ai-consciousness-soul.yaml'),
            import('../conversations/vibecoding-debate.yaml')
        ]);

        // Parse YAML content
        conversations['ai-healthcare-future'] = yaml.load(aiHealthcareFutureRaw.default) as Conversation;
        conversations['ai-consciousness-soul'] = yaml.load(aiConsciousnessSoulRaw.default) as Conversation;
        conversations['vibecoding-debate'] = yaml.load(vibecodingDebateRaw.default) as Conversation;

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

// Available conversation IDs
export const AVAILABLE_CONVERSATIONS: string[] = [
    'ai-healthcare-future',
    'ai-consciousness-soul',
    'vibecoding-debate'
];

export type ConversationId = typeof AVAILABLE_CONVERSATIONS[number];

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
    const participants = conversation.participants.map(p => ({
        name: p.name,
        isMe: p.isMe || false,
        fullname: p.fullname,
        color: p.color,
        avatar: p.avatar,
    }));

    // Convert messages to Chat component format
    const messages = conversation.messages.map(msg => ({
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
            value: conversationsCache[prop]
        };
    }
});
