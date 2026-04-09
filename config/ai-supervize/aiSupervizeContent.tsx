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
        Typicky pro týmy s vlastní codebase a pravidelným delivery flow, často ve stacku{' '}
        <strong>Full-Stack / TypeScript / JavaScript / Next.js</strong>. Když zjistíme, že pro vás AI Supervize
        vhodná není, řekneme to rovnou a doporučíme jiný postup.
    </>
);

export const aiSupervizeSituations: FeatureCard[] = [
    {
        icon: Target,
        eyebrow: 'Situace A',
        title: 'AI zatím nepoužíváte nebo si nejste jistí',
        description:
            'Pomůžeme zvolit první use-casy s nejvyšším dopadem a nastavit bezpečný start bez zbytečných experimentů naslepo.',
        items: [
            'Vybereme, kde začít a co naopak ještě nedává smysl.',
            'Nastavíme bezpečnost a pravidla pro data.',
            'Doporučíme nástroje a modely s rozumným poměrem cena / výkon.',
            'Připravíme tým na první měsíc: proces, šablony, onboarding i měření.',
        ],
        highlight: 'Cíl: rychlý a bezpečný start',
    },
    {
        icon: Gauge,
        eyebrow: 'Situace B',
        title: 'AI už používáte, ale výsledky kolísají',
        description:
            'Srovnáme workflow, review a očekávání tak, aby AI přinášela stabilní výkon místo náhodných špiček a propadů.',
        items: [
            'Sjednotíme workflow pro tvorbu změn a code review.',
            'Snížíme rework a regresní chyby.',
            'Zlepšíme dokumentaci a AI-readiness repa.',
            'Zavedeme měření dopadu, abyste odlišili přínos od placeba.',
        ],
        highlight: 'Cíl: méně chaosu, více výkonu',
    },
];

export const aiSupervizeSymptoms: FeatureCard[] = [
    {
        icon: Shield,
        title: '„Nechceme pouštět kód ven a bojíme se o citlivá data.“',
        description: 'Nastavíme data režim, povolené nástroje a jasné mantinely pro práci s AI.',
    },
    {
        icon: Search,
        title: '„Nevíme, kde začít a co je pro nás relevantní.“',
        description: 'Vybereme use-casy s nejlepším poměrem dopad / riziko / náklad.',
    },
    {
        icon: Code,
        title: '„AI generuje hodně kódu, ale kvalita kolísá a review bolí.“',
        description: 'Zavedeme Definition of Done, review checklisty a workflow pro kontrolovaný výstup.',
    },
    {
        icon: GitPullRequest,
        title: '„PRka jsou velká, těžko se kontrolují a často se vrací.“',
        description: 'Upravíme change workflow tak, aby AI pomáhala se změnami, ne s jejich nafukováním.',
    },
    {
        icon: Workflow,
        title: '„Každý používá jiný nástroj a nikdo neví, kdy co použít.“',
        description: 'Vznikne Tool & Model Matrix a týmová pravidla pro delegaci práce na AI.',
    },
    {
        icon: FileText,
        title: '„Dokumentace je slabá a AI návrhy jsou mimo.“',
        description: 'Posílíme kontext repa, aby AI viděla systém správně a návrhy nebyly odtržené od reality.',
    },
    {
        icon: BarChart3,
        title: '„AI někdy pomáhá a někdy nám rozbije den.“',
        description: 'Zavedeme metriky a pravidelné vyhodnocování, abyste věděli, co opravdu funguje.',
    },
];

export const aiSupervizeDeliverables: FeatureCard[] = [
    {
        icon: Map,
        eyebrow: '1',
        title: 'AI Adoption Plan',
        description: 'Rozhodnutí, jestli AI zavést, kde začít a co v aktuální situaci odložit.',
        items: [
            'Doporučení zda a jak AI zavést, nebo proč ještě počkat.',
            'Prioritizované use-casy: rychlé výhry vs. systémové změny.',
            'Rozhodnutí pro tooling, modely a režim práce s daty.',
        ],
        highlight: 'Start / Scale',
    },
    {
        icon: BookOpen,
        eyebrow: '2',
        title: 'AI Development Playbook',
        description: 'Pravidla a workflow pro tým, který chce používat AI bezpečně, stejně a opakovatelně.',
        items: [
            'Workflow od požadavku po merge.',
            'Pravidla kdy delegovat, co kontrolovat a co zakázat.',
            'Definition of Done pro AI-pomáhané změny.',
            'Doporučený proces code review včetně AI asistence.',
        ],
        highlight: 'PDF / Notion / MD',
    },
    {
        icon: Bot,
        eyebrow: '3',
        title: 'Tool & Model Matrix',
        description: 'Jasný přehled, který nástroj a model patří na jaký typ práce.',
        items: [
            'Architektura, refactor, testy, debug, dokumentace a další úlohy.',
            'Pravidla co je povolené a zakázané včetně citlivých dat.',
            'Doporučení s ohledem na náklady, ne jen na hype.',
        ],
        highlight: 'Náklady + bezpečnost',
    },
    {
        icon: GitBranch,
        eyebrow: '4',
        title: 'Repo & PR šablony',
        description: 'Konkrétní šablony a checklisty, které zkrátí cestu od business zadání k hotové změně.',
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
        description: 'Backlog zavádění AI Supervize rozložený do kroků, které lze skutečně doručit.',
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
        title: 'AI coding nástroje a modely',
        items: [
            'Codex, Claude Code, Copilot, Cline, Codeium, Cursor a další.',
            'Jak vybrat správný model na správný typ práce.',
        ],
    },
    {
        icon: Wrench,
        title: 'Editory a prostředí',
        items: [
            'VS Code, JetBrains, AI IDE a jejich nastavení.',
            'Agenti, oprávnění, bezpečnost a lokální workflow.',
        ],
    },
    {
        icon: GitPullRequest,
        title: 'Git a změnový workflow',
        items: [
            'Worktree, branch strategie, velikost PR a review flow.',
            'Jak zabránit tomu, aby AI zvětšovala změny a zhoršovala mergeability.',
        ],
    },
    {
        icon: Workflow,
        title: 'PRD -> Issue -> PR pipeline',
        items: [
            'Jak převést business požadavek do implementace bez ztráty kontextu.',
            'Kde má AI pomoci s analýzou, návrhem a psaním změn.',
        ],
    },
    {
        icon: FileText,
        title: 'Dokumentace, observability a debugging',
        items: [
            'Co AI potřebuje, aby rozuměla vašemu systému.',
            'Jak propojit logging, error handling a debug workflow s AI.',
        ],
    },
    {
        icon: Server,
        title: 'CI/CD a release bezpečnost',
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
        title: 'Školení nebo workshop',
        description:
            'Na začátku zvolíme formát podle velikosti týmu a toho, jestli potřebujete společný základ nebo řešit konkrétní workflow.',
        items: [
            'Školení u vás ve firmě: 3 hodiny za 40 000 Kč.',
            'Online workshop: 500 Kč za účastníka a hodinu.',
            'Obě varianty se při pokračování započítávají do ceny AI Supervize.',
        ],
        highlight: 'Výstup: společný rámec + další doporučení',
    },
    {
        icon: Wrench,
        eyebrow: '2',
        title: 'AI Supervize a nastavení',
        description: 'Připravíme konkrétní výstupy a doladíme je do reality vašeho týmu.',
        items: [
            'Adoption Plan + Playbook + Tool Matrix.',
            'Repo a PR šablony, workflow a 30/60/90 plán.',
            'Společné doladění, aby šlo vše reálně zavést.',
        ],
        highlight: 'Online nebo u vás',
    },
    {
        icon: BarChart3,
        eyebrow: '3',
        title: 'Měsíční follow-up',
        description: 'Supervize nekončí dokumentem. Pomůžeme vám změnu skutečně usadit.',
        items: [
            'Vyhodnotíme metriky a skutečný dopad.',
            'Upravíme pravidla, šablony a workflow podle reality.',
            'Pomůžeme posuzovat nové nástroje i problémy po cestě.',
        ],
        highlight: 'Kontinuální zlepšování',
    },
];

export const aiSupervizeSecurity: FeatureCard[] = [
    {
        icon: Lock,
        title: 'NDA jako standard',
        description: 'Pracujeme standardně pod NDA a nastavujeme rozsah sdílených informací dopředu.',
    },
    {
        icon: Shield,
        title: 'Pravidla pro data předem',
        description: 'Ještě před zaváděním nastavíme, co smí do AI, co se rediguje a co zůstává mimo modely.',
    },
    {
        icon: Server,
        title: 'Workflow i pro vyšší nároky',
        description: 'Umíme navrhnout redakci dat, izolované prostředí i workflow pro interní modely.',
    },
];
