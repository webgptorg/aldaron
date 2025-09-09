import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export interface ConversationParticipant {
    name: string;
    fullname: string;
    color: string;
    personality: string;
    avatar: string;
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

// List of available conversations
export const AVAILABLE_CONVERSATIONS = [
    'ai-healthcare-future',
    'ai-consciousness-soul',
    'vibecoding-debate',
] as const;

export type ConversationId = typeof AVAILABLE_CONVERSATIONS[number];

// Load a conversation from YAML file
export function loadConversation(id: ConversationId): Conversation {
    try {
        const filePath = join(process.cwd(), 'conversations', `${id}.yaml`);
        const fileContent = readFileSync(filePath, 'utf8');
        const conversation = yaml.load(fileContent) as Conversation;
        return conversation;
    } catch (error) {
        console.error(`Failed to load conversation ${id}:`, error);
        throw new Error(`Conversation ${id} not found`);
    }
}

// Get conversation metadata (without loading full content)
export function getConversationMetadata(id: ConversationId) {
    const conversation = loadConversation(id);
    return {
        id,
        title: conversation.title,
        description: conversation.description,
        participantCount: conversation.participants.length,
        messageCount: conversation.messages.length,
    };
}

// Get all conversation metadata
export function getAllConversationMetadata() {
    return AVAILABLE_CONVERSATIONS.map(getConversationMetadata);
}

// Convert conversation to Chat component format
export function convertToChat(conversation: Conversation) {
    // Create participants map for Chat component
    const participants = conversation.participants.map(p => ({
        name: p.name,
        isMe: false,
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
