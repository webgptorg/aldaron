import { FeatureCard } from '@/components/feature-cards-section';
import { Briefcase, ClipboardList, Code, Gauge, GitBranch, Search, Shield, Target, Users } from 'lucide-react';

export interface HackathonFactoryHighlight {
    value: string;
    label: string;
    description: string;
}

export const hackathonFactoryHighlights: HackathonFactoryHighlight[] = [
    {
        value: '1-2 dny',
        label: 'sprint',
        description: 'Online nebo prezenčně, vždy nad jedním konkrétním zadáním z praxe.',
    },
    {
        value: '0 Kč',
        label: 'zveřejnění zadání',
        description: 'Úvodní konzultace i posouzení vhodnosti bez závazků.',
    },
    {
        value: 'Prototyp / plán / rozhodnutí',
        label: 'výstup',
        description: 'Výsledek, který druhý den použijete ve firmě nebo produktu.',
    },
];

export const hackathonFactoryProcessNote = (
    <>
        <strong>Výsledek není soutěž o tričko.</strong> Výsledek je <strong>funkční prototyp</strong>,{' '}
        <strong>rozhodnutí</strong> nebo <strong>plán</strong>, který můžete hned další den použít.
    </>
);

export const hackathonFactoryProcess: FeatureCard[] = [
    {
        icon: ClipboardList,
        eyebrow: '1',
        title: 'Zadání problému',
        description:
            'Přihlásíte krátký brief a společně ho zpřesníme tak, aby byl řešitelný během jednoho hackathon sprintu.',
        items: [
            'Krátký formulář nebo rychlý call s námi.',
            'Vyjasnění scope, omezení, dat a očekávaného výstupu.',
            'Schválené zadání a briefing pro účastníky.',
        ],
        highlight: 'Do 2 týdnů před akcí',
    },
    {
        icon: Code,
        eyebrow: '2',
        title: 'Hackathon sprint',
        description:
            'Vývojáři pracují na vašem zadání v reálném čase a na konci prezentují to, co skutečně vzniklo.',
        items: [
            '1-2 dny, online nebo prezenčně.',
            'Funkční demo, prototyp nebo rozhodovací podklad.',
            'Dokumentace, která dává smysl i po skončení sprintu.',
        ],
        highlight: 'Reálné řešení, ne slide deck',
    },
    {
        icon: Users,
        eyebrow: '3',
        title: 'Navázání spolupráce',
        description:
            'Když si sednete s konkrétním týmem nebo jednotlivci, pomůžeme spolupráci navázat i po hackathonu.',
        items: [
            'Volitelné pokračování po sprintu.',
            'Doporučení lidí, kteří vašemu problému rozuměli nejlépe.',
            'Žádná provize, žádná vynucená vazba.',
        ],
        highlight: 'Férové propojení bez bariér',
    },
];

export const hackathonFactoryAudience: FeatureCard[] = [
    {
        icon: Briefcase,
        eyebrow: 'Máte problém k řešení',
        title: 'Pro firmy, startupy, CTO i inovátory',
        description:
            'Když potřebujete rychle zjistit, co je reálně možné, bez nabírání lidí a bez velkého projektu naslepo.',
        items: [
            'Máte produkt nebo proces, který by šel zlepšit.',
            'Chcete rychle otestovat hypotézu nebo nový směr.',
            'Potřebujete vidět funkční výsledek dřív, než investujete víc.',
            'Hledáte lidi, se kterými případně navážete další spolupráci.',
        ],
        highlight: 'Reálné zadání z vaší praxe',
    },
    {
        icon: Target,
        eyebrow: 'Chcete řešit problémy',
        title: 'Pro developery, designéry a technology',
        description:
            'Když vás víc baví něco postavit než o tom dlouho mluvit a chcete portfolio projektů s reálným dopadem.',
        items: [
            'Pracujete raději s konkrétním briefem než s umělou soutěžní výzvou.',
            'Chcete vidět problém z produkční reality firmy nebo produktu.',
            'Láká vás možnost navázat po hackathonu delší spolupráci.',
            'Dává vám smysl rychlé prototypování, validace a rozhodování.',
        ],
        highlight: 'Buildři, ne jen posluchači',
    },
];

export const hackathonFactorySituations: FeatureCard[] = [
    {
        icon: Search,
        title: '„Nevíme, jestli se nám tahle automatizace vůbec vyplatí.“',
        description: 'Ověříte hypotézu na konkrétním procesu bez nákupu drahého projektu naslepo.',
    },
    {
        icon: Code,
        title: '„Máme nápad, ale nemáme kapacitu ho interně prototypovat.“',
        description: 'Sprint dá rychlou odpověď, co funguje a co zatím nemá smysl stavět.',
    },
    {
        icon: Gauge,
        title: '„Chceme vidět víc řešení najednou, ne jen jednu cestu.“',
        description: 'Různé týmy mohou ukázat odlišné přístupy, které pak srovnáte podle výsledku.',
    },
    {
        icon: Users,
        title: '„Chceme najít vývojáře, se kterými bychom pokračovali dál.“',
        description: 'Hackathon ukáže nejen technické řešení, ale i to, s kým se vám dobře spolupracuje.',
    },
    {
        icon: GitBranch,
        title: '„Potřebujeme rozhodnutí dřív, než se upíšeme většímu rozpočtu.“',
        description: 'Na konci dostanete doporučení a další kroky, ne jen pocit, že se něco dělo.',
    },
];

export const hackathonFactoryPrinciplesNote = (
    <>Když zjistíme, že zadání není pro Hackathon Factory vhodné, řekneme to rovnou a doporučíme jiný postup.</>
);

export const hackathonFactoryPrinciples: FeatureCard[] = [
    {
        icon: GitBranch,
        title: 'Iterativní',
        description: 'Výstupy jsou navržené tak, aby na ně šlo navázat dalším sprintem nebo implementací.',
    },
    {
        icon: Shield,
        title: 'Udržitelné',
        description: 'Zadání musí dávat smysl i po hackathonu, ne jen během dvou intenzivních dnů.',
    },
    {
        icon: Target,
        title: 'Reálné',
        description: 'Odmítáme vágní nebo nerealizovatelná zadání, která by nevedla k použitelnému výsledku.',
    },
];
