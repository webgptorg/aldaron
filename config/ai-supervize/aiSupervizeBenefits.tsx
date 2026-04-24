import { Benefit } from '@/components/benefits-section';

export const aiSupervizeBenefits: Array<Benefit> = [
    {
        iconName: 'Zap',
        title: 'Kratší time-to-merge',
        description:
            'Menší změny, jasné workflow a promyšlená delegace na AI zkrátí cestu od požadavku po merge.',
    },
    {
        iconName: 'Shield',
        title: 'Bezpečný start i scale',
        description:
            'Nastavíme pravidla pro data, povolené nástroje a kontrolní body tak, aby AI nepřidávala zbytečné riziko.',
    },
    {
        iconName: 'Code',
        title: 'Méně reworku a regresí',
        description:
            'AI nebude generovat kód bez mantinelů. Dostane pravidla, review guardraily a Definition of Done.',
    },
    {
        iconName: 'FileStack',
        title: 'Čitelnější a konzistentní výstup',
        description:
            'Sjednotíme PRD -> issue -> PR pipeline, šablony a způsob dokumentace, aby změny dávaly smysl i po týdnech.',
    },
    {
        iconName: 'Users',
        title: 'Stejný způsob práce napříč týmem',
        description:
            'Každý nebude používat jiný nástroj a jiný prompt. Vznikne opakovatelný týmový playbook.',
    },
    {
        iconName: 'Book',
        title: 'Měřitelný dopad',
        description:
            'Zavedeme metriky jako lead time, doba review, reopen rate nebo incident rate, abyste poznali přínos od placeba.',
    },
];
