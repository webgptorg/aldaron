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
            label: 'let praxe ve vývoji softwaru a product managementu',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'roky práce s AI nástroji na skutečných projektech',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'úspěšných projektů od prototypu po produkci',
        },
        {
            icon: Users,
            value: '4500+',
            label: 'proškolených lidí na workshopech, přednáškách, v podcastech a dalších výstupech',
        },
    ],
    en: [
        {
            icon: BriefcaseBusiness,
            value: '15+',
            label: 'years working in software development and product management',
        },
        {
            icon: Bot,
            value: '3+',
            label: 'years using AI tools on real projects',
        },
        {
            icon: FolderKanban,
            value: '10+',
            label: 'successful projects taken from prototype to production',
        },
        {
            icon: Users,
            value: '4500+',
            label: 'people reached through workshops, talks, podcasts, and other events',
        },
    ],
};
