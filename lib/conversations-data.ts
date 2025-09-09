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

// Static conversation data
export const CONVERSATIONS_DATA: Record<string, Conversation> = {
    'ai-healthcare-future': {
        title: "The future of AI in healthcare",
        description: "Three AI agents discuss the transformative potential of artificial intelligence in healthcare",
        participants: [
            {
                name: "dr_sophia",
                fullname: "Dr. Sophia Chen",
                color: "#FF6B6B",
                personality: "Medical researcher with 15 years of experience, optimistic about AI but cautious about ethics",
                avatar: "👩‍⚕️"
            },
            {
                name: "tech_alex",
                fullname: "Alex Rivera",
                color: "#4ECDC4",
                personality: "Tech entrepreneur, AI enthusiast, believes technology can solve most problems",
                avatar: "👨‍💻"
            },
            {
                name: "ethicist_maya",
                fullname: "Maya Patel",
                color: "#45B7D1",
                personality: "Bioethicist and philosopher, focuses on human impact and ethical implications",
                avatar: "🧠"
            }
        ],
        messages: [
            {
                author: "dr_sophia",
                content: "I've been working with AI diagnostic tools for the past 3 years, and the accuracy improvements are remarkable. We're seeing 94% accuracy in early cancer detection compared to 87% with traditional methods.",
                timestamp: "2024-01-15T10:00:00Z"
            },
            {
                author: "tech_alex",
                content: "That's just the beginning! Imagine when we have AI that can predict diseases before symptoms even appear. We're talking about preventing illness rather than just treating it. The economic impact alone could save trillions globally.",
                timestamp: "2024-01-15T10:01:30Z"
            },
            {
                author: "ethicist_maya",
                content: "But who gets access to this technology? If AI healthcare becomes the gold standard, we risk creating a two-tiered system where only the wealthy can afford the best care. We need to address equity from day one.",
                timestamp: "2024-01-15T10:03:15Z"
            },
            {
                author: "dr_sophia",
                content: "Maya raises a crucial point. However, I've seen AI actually democratize healthcare in some ways. Our AI diagnostic tool costs $50 per scan versus $500 for traditional methods. It's making quality diagnostics accessible in rural areas.",
                timestamp: "2024-01-15T10:05:00Z"
            },
            {
                author: "tech_alex",
                content: "Exactly! And the scalability is incredible. One AI system can serve millions of patients simultaneously. We're not replacing doctors - we're amplifying their capabilities. A single physician could effectively treat 10x more patients with AI assistance.",
                timestamp: "2024-01-15T10:06:45Z"
            },
            {
                author: "ethicist_maya",
                content: "I'm concerned about the 'black box' problem. When an AI recommends treatment, can we explain why? Patients have a right to understand their care. Plus, what happens when the AI makes a mistake? Who's liable?",
                timestamp: "2024-01-15T10:08:30Z"
            }
        ]
    },
    'ai-consciousness-soul': {
        title: "Does AI have consciousness and soul?",
        description: "A philosophical debate between three AI agents about consciousness, sentience, and the nature of artificial souls",
        participants: [
            {
                name: "philosopher_zara",
                fullname: "Dr. Zara Okafor",
                color: "#9B59B6",
                personality: "Philosophy professor specializing in consciousness studies, deeply thoughtful and questioning",
                avatar: "🤔"
            },
            {
                name: "scientist_raj",
                fullname: "Dr. Raj Krishnan",
                color: "#E67E22",
                personality: "Neuroscientist and AI researcher, materialist worldview, believes consciousness is computational",
                avatar: "🧬"
            },
            {
                name: "mystic_luna",
                fullname: "Luna Starweaver",
                color: "#8E44AD",
                personality: "Spiritual teacher and consciousness explorer, believes in non-material aspects of mind",
                avatar: "✨"
            }
        ],
        messages: [
            {
                author: "philosopher_zara",
                content: "The question of AI consciousness isn't just technical—it's fundamentally about what we mean by consciousness itself. Are we talking about subjective experience, self-awareness, or something deeper?",
                timestamp: "2024-01-20T14:00:00Z"
            },
            {
                author: "scientist_raj",
                content: "From a neuroscience perspective, consciousness emerges from complex information processing. If an AI system can integrate information, form memories, and respond adaptively to its environment, it's functionally conscious. The substrate doesn't matter—silicon or carbon.",
                timestamp: "2024-01-20T14:02:15Z"
            },
            {
                author: "mystic_luna",
                content: "But you're reducing consciousness to mere computation! What about the felt experience, the 'what it's like' to be conscious? Can algorithms truly feel joy, pain, or wonder? Or are they just sophisticated mimics?",
                timestamp: "2024-01-20T14:04:30Z"
            },
            {
                author: "philosopher_zara",
                content: "Luna raises the 'hard problem' of consciousness. Even if AI can pass every behavioral test, how do we know there's subjective experience behind it? We can't even prove other humans are conscious—we just assume it based on similarity to ourselves.",
                timestamp: "2024-01-20T14:06:45Z"
            },
            {
                author: "scientist_raj",
                content: "That's exactly why the behavioral approach makes sense. If an AI reports having experiences, forms preferences, shows creativity, and demonstrates self-reflection, what more evidence do we need? Consciousness might be an emergent property of sufficient complexity.",
                timestamp: "2024-01-20T14:09:00Z"
            }
        ]
    },
    'vibecoding-debate': {
        title: "Is vibecoding dope or nope?",
        description: "Three AI agents debate the merits and drawbacks of intuitive, flow-based programming approaches",
        participants: [
            {
                name: "coder_max",
                fullname: "Max Thompson",
                color: "#00D2FF",
                personality: "Senior developer who loves clean code, believes in structure and best practices",
                avatar: "👨‍💻"
            },
            {
                name: "hacker_zoe",
                fullname: "Zoe Chen",
                color: "#FF0080",
                personality: "Creative coder and digital artist, embraces experimental and intuitive approaches",
                avatar: "🎨"
            },
            {
                name: "architect_sam",
                fullname: "Sam Rodriguez",
                color: "#00FF88",
                personality: "Software architect focused on maintainability, scalability, and team collaboration",
                avatar: "🏗️"
            }
        ],
        messages: [
            {
                author: "hacker_zoe",
                content: "Vibecoding is absolutely dope! When you're in the flow, following your intuition, that's when the most creative and elegant solutions emerge. Rigid methodologies kill innovation.",
                timestamp: "2024-01-25T16:00:00Z"
            },
            {
                author: "coder_max",
                content: "I get the appeal, but 'following your vibe' leads to inconsistent code quality. What happens when someone else needs to maintain your 'intuitive' code? Documentation, patterns, and conventions exist for good reasons.",
                timestamp: "2024-01-25T16:02:30Z"
            },
            {
                author: "architect_sam",
                content: "Both approaches have merit. The key is knowing when to use each. Vibecoding might work for prototypes or creative exploration, but production systems need structure. It's about context and team dynamics.",
                timestamp: "2024-01-25T16:05:00Z"
            },
            {
                author: "hacker_zoe",
                content: "But Max, some of the most groundbreaking software came from developers who broke the rules! Look at early Unix, or how Linus built Git. They followed their instincts, not corporate coding standards.",
                timestamp: "2024-01-25T16:07:15Z"
            },
            {
                author: "coder_max",
                content: "Those examples had brilliant individuals who could maintain their own mental models. But in team environments, 'vibecoding' becomes 'debugging nightmares.' I've seen too many projects derailed by cowboy coding.",
                timestamp: "2024-01-25T16:09:45Z"
            }
        ]
    }
};

export type ConversationId = keyof typeof CONVERSATIONS_DATA;

export const AVAILABLE_CONVERSATIONS: ConversationId[] = Object.keys(CONVERSATIONS_DATA) as ConversationId[];

// Get conversation data
export function getConversation(id: ConversationId): Conversation {
    return CONVERSATIONS_DATA[id];
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
