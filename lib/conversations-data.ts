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

// <- TODO: !!!! This should be responsibility of Promptbook - serialization / deserialization of conversations