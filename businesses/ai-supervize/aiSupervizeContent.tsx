import { FeatureCard } from '@/components/feature-cards-section';
import {
    BarChart3,
    BookOpen,
    Bot,
    ClipboardList,
    Code,
    FileText,
    Gauge,
    GitBranch,
    GitPullRequest,
    Lock,
    Map,
    Search,
    Server,
    Shield,
    Target,
    Workflow,
    Wrench,
} from 'lucide-react';

export const aiSupervizeSituationsNote = (
    <>
        Nejčastěji pracujeme s týmy, které mají vlastní codebase a pravidelný delivery flow, často ve stacku{' '}
        <strong>Full-Stack / TypeScript / JavaScript / Next.js</strong>. Když zjistíme, že se pro vás AI Supervize
        nehodí, řekneme to rovnou a doporučíme jiný postup.
    </>
);

export const aiSupervizeSituations: FeatureCard[] = [
    {
        icon: Target,
        eyebrow: 'Situace A',
        title: 'AI zatím nepoužíváte nebo váháte, kde začít',
        description:
            'Najdeme první use-cases s největším přínosem a nastavíme bezpečný start bez pokusů naslepo.',
        items: [
            'Vybereme, kde začít a co naopak ještě nedává smysl.',
            'Nastavíme bezpečnost a pravidla pro data.',
            'Doporučíme nástroje a modely s rozumným poměrem ceny a výkonu.',
            'Připravíme tým na první měsíc: proces, šablony, onboarding i měření.',
        ],
        highlight: 'Cíl: začít rychle a bezpečně',
    },
    {
        icon: Gauge,
        eyebrow: 'Situace B',
        title: 'AI používáte, ale výsledky kolísají',
        description:
            'Srovnáme workflow, review a očekávání, aby AI přinášela stabilní výkon místo náhodných špiček a propadů.',
        items: [
            'Sjednotíme workflow pro tvorbu změn a code review.',
            'Snížíme rework a regresní chyby.',
            'Zlepšíme dokumentaci a AI-readiness repa.',
            'Zavedeme měření dopadu, abyste odlišili přínos od placeba.',
        ],
        highlight: 'Cíl: méně chaosu a stabilní výkon',
    },
];

export const aiSupervizeSymptoms: FeatureCard[] = [
    {
        icon: Shield,
        title: '"Nechceme pouštět kód ven a bojíme se o citlivá data."',
        description: 'Nastavíme, jak pracovat s daty, povolené nástroje a jasné mantinely pro práci s AI.',
    },
    {
        icon: Search,
        title: '"Nevíme, kde začít a co je pro nás relevantní."',
        description: 'Vybereme use-cases s nejlepším poměrem přínosu, rizika a nákladu.',
    },
    {
        icon: Code,
        title: '"AI generuje hodně kódu, ale kvalita kolísá a review bolí."',
        description: 'Zavedeme Definition of Done, review checklisty a workflow, které udrží výstup pod kontrolou.',
    },
    {
        icon: GitPullRequest,
        title: '"PRka jsou velká, těžko se kontrolují a často se vrací."',
        description: 'Upravíme change workflow tak, aby AI pomáhala se změnami, místo aby je nafukovala.',
    },
    {
        icon: Workflow,
        title: '"Každý používá jiný nástroj a nikdo neví, kdy co použít."',
        description: 'Vytvoříme Tool & Model Matrix a týmová pravidla pro delegování práce na AI.',
    },
    {
        icon: FileText,
        title: '"Dokumentace je slabá a AI návrhy jsou mimo."',
        description: 'Doplníme kontext repa, aby AI rozuměla systému a její návrhy odpovídaly realitě.',
    },
    {
        icon: BarChart3,
        title: '"AI někdy pomáhá a někdy nám rozbije den."',
        description: 'Zavedeme metriky a pravidelné vyhodnocování, abyste věděli, co funguje.',
    },
];

export const aiSupervizeDeliverables: FeatureCard[] = [
    {
        icon: Map,
        eyebrow: '1',
        title: 'AI Adoption Plan',
        description: 'Rozhodnutí, jestli AI zavést, kde začít a co zatím odložit.',
        items: [
            'Doporučení, zda a jak AI zavést, nebo proč ještě počkat.',
            'Prioritizované use-casy: rychlé výhry vs. systémové změny.',
            'Rozhodnutí pro tooling, modely a režim práce s daty.',
        ],
        highlight: 'Start / Scale',
    },
    {
        icon: BookOpen,
        eyebrow: '2',
        title: 'AI Development Playbook',
        description: 'Pravidla a workflow pro tým, který chce AI používat bezpečně a stejným způsobem.',
        items: [
            'Workflow od požadavku po merge.',
            'Pravidla, kdy delegovat, co kontrolovat a co zakázat.',
            'Definition of Done pro AI-pomáhané změny.',
            'Doporučený proces code review včetně AI asistence.',
        ],
        highlight: 'PDF / Notion / MD',
    },
    {
        icon: Bot,
        eyebrow: '3',
        title: 'Tool & Model Matrix',
        description: 'Přehled, který nástroj a model se hodí na jaký typ práce.',
        items: [
            'Architektura, refactor, testy, debug, dokumentace a další úlohy.',
            'Pravidla, co je povolené a zakázané, včetně citlivých dat.',
            'Doporučení s ohledem na náklady, ne jen na hype.',
        ],
        highlight: 'Náklady + bezpečnost',
    },
    {
        icon: GitBranch,
        eyebrow: '4',
        title: 'Repo & PR šablony',
        description: 'Šablony a checklisty, které zkrátí cestu od business zadání k hotové změně.',
        items: [
            'Šablony pro issue, PRD, PR a commit messages.',
            'Checklisty pro review a release.',
            'Doporučená branch strategie podle reality týmu.',
        ],
        highlight: 'PRD / issue / PR / commit',
    },
    {
        icon: ClipboardList,
        eyebrow: '5',
        title: 'Implementační plán 30 / 60 / 90',
        description: 'Backlog zavedení AI Supervize rozdělený do kroků, které lze skutečně doručit.',
        items: [
            'Konkrétní backlog položky, priority a očekávaný dopad.',
            'Metriky jako lead time, doba review, reopen rate nebo incident rate.',
            'Jasná definice, podle čeho poznáte, že změna funguje.',
        ],
        highlight: 'Metriky + backlog',
    },
];

export const aiSupervizeFocusAreas: FeatureCard[] = [
    {
        icon: Bot,
        title: 'AI nástroje pro programování a modely',
        items: [
            'Codex, Claude Code, Copilot, Cline, Codeium, Cursor a další.',
            'Jak vybrat správný model na správný typ práce.',
        ],
    },
    {
        icon: Wrench,
        title: 'Editory a vývojové prostředí',
        items: ['VS Code, JetBrains, AI IDE a jejich nastavení.', 'Agenti, oprávnění, bezpečnost a lokální workflow.'],
    },
    {
        icon: GitPullRequest,
        title: 'Git a workflow změn',
        items: [
            'Worktree, branch strategie, velikost PR a review flow.',
            'Jak zabránit tomu, aby AI zvětšovala změny a zhoršovala mergeability.',
        ],
    },
    {
        icon: Workflow,
        title: 'Cesta od PRD k PR',
        items: [
            'Jak převést business požadavek do implementace bez ztráty kontextu.',
            'Kde má AI pomoci s analýzou, návrhem a psaním změn.',
        ],
    },
    {
        icon: FileText,
        title: 'Dokumentace, observability a ladění',
        items: [
            'Co AI potřebuje, aby rozuměla vašemu systému.',
            'Jak propojit logging, error handling a debug workflow s AI.',
        ],
    },
    {
        icon: Server,
        title: 'CI/CD a bezpečné releasy',
        items: [
            'Kde AI v CI/CD dává smysl a kde je naopak riziková.',
            'Jak nastavit release checklisty a kontrolní body.',
        ],
    },
];

export const aiSupervizeProcess: FeatureCard[] = [
    {
        icon: Search,
        eyebrow: '1',
        title: 'Najdeme první krok',
        description: 'Začít můžeme školením ve firmě, online workshopem nebo discovery blokem s vedením týmu.',
        items: [
            'Školení ve firmě pro širší tým a rychlé srovnání očekávání.',
            'Online workshop pro konkrétní use-case, tooling nebo workflow.',
            'Discovery workshop s CTO nebo Tech Leadem pro rozhodnutí, jak dál.',
        ],
        highlight: 'Cenu prvního kroku odečteme',
    },
    {
        icon: Wrench,
        eyebrow: '2',
        title: 'Nastavíme AI Supervizi',
        description: 'Po prvním kroku připravíme konkrétní výstupy a doladíme je podle reality vašeho týmu.',
        items: [
            'Adoption Plan + Playbook + Tool Matrix.',
            'Repo a PR šablony, workflow a 30/60/90 plán.',
            'Společné doladění, aby šlo vše reálně zavést.',
        ],
        highlight: 'Playbook, šablony a 30/60/90',
    },
    {
        icon: BarChart3,
        eyebrow: '3',
        title: 'Měsíční follow-up',
        description: 'Až tým začne podle pravidel pracovat, pomůžeme změnu dál ladit a vyhodnocovat.',
        items: [
            'Vyhodnotíme metriky a skutečný dopad.',
            'Upravíme pravidla, šablony a workflow podle reality.',
            'Pomůžeme posuzovat nové nástroje i problémy po cestě.',
        ],
        highlight: 'Průběžné ladění',
    },
];

export const aiSupervizeSecurity: FeatureCard[] = [
    {
        icon: Lock,
        title: 'NDA je standard',
        description: 'Pracujeme pod NDA a rozsah sdílených informací si nastavíme dopředu.',
    },
    {
        icon: Shield,
        title: 'Pravidla pro data nastavíme předem',
        description: 'Než začneme, domluvíme, co smí do AI, co se rediguje a co zůstává mimo modely.',
    },
    {
        icon: Server,
        title: 'Workflow i pro vyšší nároky',
        description: 'Navrhneme redakci dat, izolované prostředí i workflow pro interní modely.',
    },
];
