import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LucideIcon } from 'lucide-react';
import { Bot, BriefcaseBusiness, FolderKanban, Users } from 'lucide-react';

export type PavolNumber = {
    icon: LucideIcon;
    value: string;
    label: string;
};

export const pavolNumbers: Record<SupportedHomepageLanguage, PavolNumber[]> = {
    cs: [
        {
            icon: BriefcaseBusiness,
            value: '15+',
            label: 'let zkušeností se software developmentem a product managementem',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'roky intenzivní práce s AI nástroji v reálných projektech',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'úspěšných projektů od prototypu po produkční nasazení',
        },
        {
            icon: Users,
            value: '4500+',
            label: 'proškolených lidí skrze workshopy, talks, podcasty a další výstupy',
        },
    ],
    en: [
        {
            icon: BriefcaseBusiness,
            value: '15+',
            label: 'years of experience in software development and product management',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'years of intensive work with AI tools in real projects',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'successful projects delivered from prototype to production',
        },
        {
            icon: Users,
            value: '4500+',
            label: 'people reached through workshops, talks, podcasts, and similar formats',
        },
    ],
};
