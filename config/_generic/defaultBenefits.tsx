'use client';
import { Benefit } from '../../components/benefits-section';

export const defaultBenefits: Benefit[] = [
    {
        iconName: 'Briefcase',
        title: 'Capture Company Context',
        description:
            'Easily define AI agents with specific knowledge, rules, and personalities that align with your company values.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        iconName: 'Shield',
        title: 'Reliable and Portable',
        description:
            'Books are explicit and easy to understand, ensuring your AI behaves predictably and consistently across all applications.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        iconName: 'Zap',
        title: 'Simple and Powerful',
        description:
            'Get the best of both worlds: the simplicity of no-code platforms and the deep control of heavy frameworks.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        iconName: 'Book',
        title: 'Commitments-Based Language',
        description:
            "Use Persona, Knowledge, Rule, and Action commitments to precisely define your AI agent's behavior.",
        gradient: 'from-orange-500 to-red-500',
    },
    {
        iconName: 'Code',
        title: 'Integrate Anywhere',
        description:
            'Use your book-defined AI agents in chat apps, reply agents, coding assistants, and internal applications.',
        gradient: 'from-yellow-500 to-orange-500',
    },
    {
        iconName: 'Users',
        title: 'Tailored to Your Needs',
        description:
            'Create AI agents for any role, from customer support and marketing to legal and HR, ensuring they meet your specific requirements.',
        gradient: 'from-indigo-500 to-purple-500',
    },
];
