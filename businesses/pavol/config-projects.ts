import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ExternalLink, FileText, Github } from 'lucide-react';

export type PavolProjectLink = {
    href: string;
    label: string;
    icon?: LucideIcon;
};

export type PavolProjectLogo = {
    src: string;
    className?: string;
};

export type PavolProject = {
    icon?: LucideIcon;
    logos?: PavolProjectLogo[];
    logoText?: string;
    logoFrameClassName?: string;
    title: string;
    description: string;
    links: PavolProjectLink[];
};

const promptbookLogo = '/logo/promptbook-logo-blue-transparent-128.png';
const collboardLogo = '/pavol/projects/collboard.svg';
const hEduLogo = '/pavol/projects/h-edu.svg';

export const pavolProjects: Record<SupportedHomepageLanguage, PavolProject[]> = {
    cs: [
        {
            logos: [{ src: promptbookLogo, className: 'h-7 w-7' }],
            title: 'Promptbook',
            description:
                'Ekosystém pro persistentní AI agenty, kteří pracují s cíli, pravidly, znalostmi a firemním kontextem místo jednorázového chatování.',
            links: [{ href: '/', label: 'Otevřít Promptbook', icon: ArrowRight }],
        },
        {
            logos: [
                { src: collboardLogo, className: 'h-6 w-6' },
                { src: hEduLogo, className: 'h-6 w-6' },
            ],
            logoFrameClassName: 'w-20',
            title: 'Collboard & H-edu',
            description:
                'Produkty pro vzdělávání a online spolupráci, které se osvědčily ve školách i ve chvíli, kdy bylo potřeba rychle reagovat na nový kontext.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
                { href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink },
            ],
        },
        {
            logos: [{ src: promptbookLogo, className: 'h-5 w-5' }],
            logoText: 'AI',
            logoFrameClassName: 'w-20',
            title: 'AI Supervize',
            description:
                'Praktický rámec pro firmy a týmy, které chtějí dělat AI development s menším chaosem a větší kontrolou nad kvalitou.',
            links: [{ href: '/ai-supervize', label: 'AI Supervize', icon: ArrowRight }],
        },
        {
            icon: Github,
            title: 'Všechny projekty',
            description:
                'Desítky open-source a produktových projektů od prototypů přes vzdělávání až po nástroje pro AI a vývoj.',
            links: [
                { href: 'https://github.com/hejny', label: 'GitHub', icon: Github },
                {
                    href: 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing',
                    label: 'CV',
                    icon: FileText,
                },
            ],
        },
    ],
    en: [
        {
            logos: [{ src: promptbookLogo, className: 'h-7 w-7' }],
            title: 'Promptbook',
            description:
                'An ecosystem for persistent AI agents that work with goals, rules, knowledge, and company context instead of one-off chats.',
            links: [{ href: '/', label: 'Open Promptbook', icon: ArrowRight }],
        },
        {
            logos: [
                { src: collboardLogo, className: 'h-6 w-6' },
                { src: hEduLogo, className: 'h-6 w-6' },
            ],
            logoFrameClassName: 'w-20',
            title: 'Collboard & H-edu',
            description:
                'Education and collaboration products that proved themselves in real schools, especially when teams had to adapt fast.',
            links: [
                { href: 'https://collboard.com/', label: 'Collboard', icon: ExternalLink },
                { href: 'https://www.h-edu.cz/', label: 'H-edu', icon: ExternalLink },
            ],
        },
        {
            logos: [{ src: promptbookLogo, className: 'h-5 w-5' }],
            logoText: 'AI',
            logoFrameClassName: 'w-20',
            title: 'AI Supervize',
            description:
                'A practical framework for companies and teams that want to do AI development with less chaos and more control over quality.',
            links: [{ href: '/ai-supervize', label: 'AI Supervize', icon: ArrowRight }],
        },
        {
            icon: Github,
            title: 'All projects',
            description:
                'Dozens of open-source and product projects spanning prototypes, education, AI tooling, and software development.',
            links: [
                { href: 'https://github.com/hejny', label: 'GitHub', icon: Github },
                {
                    href: 'https://docs.google.com/document/d/1M0Py3W4eul8WMfzlvlHHBs50tP2hQ1f519QomfAOhcM/edit?usp=sharing',
                    label: 'CV',
                    icon: FileText,
                },
            ],
        },
    ],
};
