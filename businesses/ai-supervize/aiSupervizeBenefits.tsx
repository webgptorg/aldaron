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
        title: 'Bezpečný start i další růst',
        description:
            'Nastavíme pravidla pro data, povolené nástroje a kontrolní body. AI tak nebude přidávat zbytečné riziko.',
    },
    {
        iconName: 'Code',
        title: 'Méně reworku a regresí',
        description:
            'Nastavíme mantinely pro generování kódu: pravidla, review guardraily a Definition of Done.',
    },
    {
        iconName: 'FileStack',
        title: 'Čitelnější a konzistentní výstup',
        description:
            'Sjednotíme cestu od PRD přes issue k PR, šablony i dokumentaci, aby změny dávaly smysl i po týdnech.',
    },
    {
        iconName: 'Users',
        title: 'Stejný způsob práce napříč týmem',
        description:
            'Sjednotíme nástroje, prompty i způsob práce a sepíšeme společný playbook.',
    },
    {
        iconName: 'Book',
        title: 'Měřitelný dopad',
        description:
            'Zavedeme metriky jako lead time, doba review, reopen rate nebo incident rate, abyste poznali, co funguje a co je jen placebo.',
    },
];
