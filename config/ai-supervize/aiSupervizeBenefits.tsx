'use client';

import { Benefit } from '@/components/benefits-section';

export const aiSupervizeBenefits: Array<Benefit> = [
    {
        iconName: 'Shield',
        title: 'Bezpečný start s AI',
        description:
            'Když AI ještě nepoužíváte, nastavíme use-casy, pravidla pro data a první měsíc zavádění tak, aby tým nezačínal metodou pokus-omyl.',
    },
    {
        iconName: 'Users',
        title: 'Jednotný workflow v celém týmu',
        description:
            'Sjednotíme, kdy AI delegovat, co musí jít do review a jaká je Definition of Done pro AI-pomáhané změny.',
    },
    {
        iconName: 'Code',
        title: 'Méně reworku a regresí',
        description:
            'Pomůžeme zmenšit PR, zpřesnit review a nastavit AI-assisted kontroly tam, kde reálně snižují chybovost.',
    },
    {
        iconName: 'FileStack',
        title: 'AI-readiness repa a dokumentace',
        description:
            'Upravíme šablony, dokumentaci a strukturu repa tak, aby AI navrhovala změny ve správném kontextu.',
    },
    {
        iconName: 'Briefcase',
        title: 'Rozumné náklady a tooling',
        description:
            'Doporučíme kombinaci nástrojů a modelů podle dopadu, rizika a rozpočtu, ne podle aktuálního hype.',
    },
    {
        iconName: 'Zap',
        title: 'Měřitelný dopad',
        description:
            'Nastavíme metriky jako lead time, review time nebo reopen rate, abyste věděli, co funguje a co je jen placebo.',
    },
];
