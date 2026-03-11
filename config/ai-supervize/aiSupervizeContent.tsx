import { ContentCard } from '@/components/content-cards-section';
import {
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle,
    Code,
    FileStack,
    GitPullRequest,
    Search,
    Shield,
    Target,
    Wrench,
    Zap,
} from 'lucide-react';

export const aiSupervizeSituations: ContentCard[] = [
    {
        icon: Search,
        eyebrow: 'Situace A',
        title: 'AI zatím nepoužíváte nebo si nejste jisti',
        description:
            'Pomůžeme vybrat, kde začít, jak ošetřit bezpečnost a jak připravit tým tak, aby první měsíc zavádění dával smysl obchodně i technicky.',
        bullets: [
            'Výběr use-casů s nejvyšším dopadem na delivery',
            'Pravidla pro data, přístupy a citlivé informace',
            'Tooling a modely s ohledem na náklady',
            'Proces, šablony, měření a onboarding pro start',
        ],
        footer: (
            <>
                <strong>Cíl:</strong> Udělat první kroky rychle, ale bez průšvihů, a vědět přesně, co bude následovat.
            </>
        ),
    },
    {
        icon: CheckCircle,
        eyebrow: 'Situace B',
        title: 'AI už používáte, ale výkon kolísá',
        description:
            'Sjednotíme workflow, review a pravidla tak, aby AI pomáhala stabilně a ne jen občas podle toho, kdo zrovna promptuje.',
        bullets: [
            'Sjednocení workflow a review disciplíny',
            'Snížení reworku, regresí a bolestivých PR',
            'Zlepšení dokumentace a AI-readiness repa',
            'Měřítka dopadu: co funguje a co je placebo',
        ],
        footer: (
            <>
                <strong>Cíl:</strong> Méně chaosu, více výkonu a předvídatelnější výsledky v delším horizontu.
            </>
        ),
    },
];

export const aiSupervizeDeliverables: ContentCard[] = [
    {
        icon: Target,
        title: 'AI Adoption Plan',
        description:
            'Dostanete doporučení, zda a jak AI zavádět, prioritizované use-casy a rozhodnutí o tooling, modelech i datovém režimu.',
    },
    {
        icon: BookOpen,
        title: 'AI Development Playbook',
        description:
            'Workflow od požadavku po merge, pravidla pro delegování na AI, Definition of Done a doporučený review proces.',
    },
    {
        icon: Shield,
        title: 'Tool & Model Matrix',
        description:
            'Jasná pravidla, které nástroje a modely použít na architekturu, refactor, testy, debug nebo dokumentaci.',
    },
    {
        icon: GitPullRequest,
        title: 'Repo a PR šablony',
        description:
            'Šablony pro issues, PRD, PR, commit messages, checklisty pro review a doporučená branch strategie podle reality týmu.',
    },
    {
        icon: Calendar,
        title: 'Plán 30/60/90 dní',
        description:
            'Konkrétní backlog, priority, očekávaný dopad a metriky, podle kterých později poznáme, že změna opravdu funguje.',
    },
];

export const aiSupervizeFocusAreas: ContentCard[] = [
    {
        icon: Code,
        title: 'AI coding nástroje a modely',
        description:
            'Codex, Claude Code, Copilot, Cline, Cursor a další nástroje pomůžeme porovnat podle typu práce, ceny a rizika.',
    },
    {
        icon: Zap,
        title: 'Editory, IDE a agentní režim',
        description:
            'Nastavení ve VS Code, JetBrains nebo AI IDE tak, aby agenti měli správný kontext a neporušovali vaše pravidla.',
    },
    {
        icon: GitPullRequest,
        title: 'Git a změnový workflow',
        description:
            'Velikost PR, branch strategie, review flow, worktree nebo bisect. Tedy vše, co rozhoduje o kvalitě AI-generovaných změn.',
    },
    {
        icon: FileStack,
        title: 'Dokumentace a AI-readiness repa',
        description:
            'Co AI potřebuje, aby správně viděla architekturu, doménu a závislosti, a kde naopak dokumentace dnes chybí.',
    },
    {
        icon: BarChart3,
        title: 'Observability, logging a debug',
        description:
            'Jak propojit AI coding s daty o dopadu změn, rychlejším řešením incidentů a předvídatelným troubleshootingem.',
    },
    {
        icon: Shield,
        title: 'Bezpečnost, data a CI/CD',
        description:
            'Co smí do AI, kde je nutná redakce dat a kde AI v CI/CD pomáhá. I kde je naopak lepší ji vůbec nepouštět.',
    },
];

export const aiSupervizeProcess: ContentCard[] = [
    {
        icon: Search,
        eyebrow: 'Krok 1',
        title: 'Discovery workshop',
        description:
            'Během 2-3 hodin s CTO nebo Tech Leadem projdeme aktuální proces tvorby změn, cíle, omezení a use-casy s nejvyšším dopadem.',
        footer: (
            <>
                <strong>Výstup:</strong> Shrnutý aktuální stav a doporučení, jestli a jak pokračovat.
            </>
        ),
    },
    {
        icon: Wrench,
        eyebrow: 'Krok 2',
        title: 'Návrh a nastavení',
        description:
            'Připravíme Adoption Plan, Playbook, Matrix, šablony a 30/60/90 plán. Pak vše projdeme a doladíme pro reálný provoz.',
        footer: (
            <>
                <strong>Výstup:</strong> Konkrétní dokumenty, workflow a pravidla připravená k zavedení.
            </>
        ),
    },
    {
        icon: BarChart3,
        eyebrow: 'Krok 3',
        title: 'Měsíční follow-up',
        description:
            'Průběžně vyhodnocujeme metriky, ladíme pravidla a pomáháme s novými problémy i nástroji, které se po cestě objeví.',
        footer: (
            <>
                <strong>Výstup:</strong> Stabilní zlepšování místo jednorázového workshopu bez návaznosti.
            </>
        ),
    },
];

export const aiSupervizeSignals: string[] = [
    'Nechceme pouštět kód ven a bojíme se o citlivá data.',
    'Nevíme, kde s AI v týmu vůbec začít.',
    'AI generuje hodně kódu, ale kvalita kolísá a review bolí.',
    'PR jsou moc veliká, těžko se kontrolují a často se vracejí.',
    'Každý používá jiný nástroj a nikdo neví, kdy co zvolit.',
    'Dokumentace je slabá, AI projektu nerozumí a návrhy jsou mimo.',
    'AI někdy pomáhá a někdy jen rozbije den.',
];
