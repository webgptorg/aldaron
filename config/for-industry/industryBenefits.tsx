'use client';
import { Benefit } from '@/components/benefits-section';

export const industryBenefits: Benefit[] = [
    {
        iconName: 'Briefcase',
        title: 'Instant Access to Technical Knowledge',
        description:
            'Provide field technicians and support staff with immediate access to relevant information from technical manuals and SOPs.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        iconName: 'Zap',
        title: 'Reduce Equipment Downtime',
        description:
            'Minimize downtime by empowering your team with AI-driven troubleshooting guides and maintenance procedures.',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        iconName: 'Shield',
        title: 'Enhance Technical Support',
        description:
            'Build AI-powered support bots that can answer complex technical questions and guide users through repairs.',
        gradient: 'from-purple-500 to-pink-500',
    },
];
