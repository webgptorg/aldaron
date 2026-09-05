import type { FAQ } from '@/components/faq-section';
import { AI_SUPERVIZE_MINI_PATH } from '@/lib/discounts/discountPlaces';
import type { LucideIcon } from 'lucide-react';
import {
    Bot,
    Bug,
    Clock,
    Code2,
    GitCompare,
    GitPullRequest,
    Layers,
    MessageSquareText,
    NotebookTabs,
    ShieldCheck,
    Sparkles,
    Workflow,
} from 'lucide-react';
import Link from 'next/link';

export function createOnlineWorkshopHeroBullets(durationLabel: string): readonly string[] {
    return [
        durationLabel,
        'Zdarma, živě',
        'TypeScript, Claude Code, Codex, Cursor',
    ];
}

export const onlineWorkshopTerminalMetrics = [
    { metric: 'Nejasná zadání', before: 8, after: 3, unit: '×' },
    { metric: 'Ruční rework', before: 12, after: 6, unit: ' h' },
    { metric: 'Velikost PR', before: 900, after: 420, unit: ' ř.' },
    { metric: 'Regrese', before: 6, after: 2, unit: '/sprint' },
];

export const onlineWorkshopImpactMetrics = [
    {
        value: '3',
        suffix: ' týdny',
        label: 'Průměrná návratnost investice za',
    },
    {
        value: '20',
        suffix: ' %',
        label: 'Průměrné zrychlení vývoje',
    },
    {
        value: '30',
        suffix: ' %',
        label: 'Méně chyb v produkci',
    },
];

type StatCard = {
    value: string;
    description: string;
    source: string;
};

export const onlineWorkshopStats: StatCard[] = [
    {
        value: '66 %',
        description:
            'vývojářů říká, že řešení od AI jsou skoro správná, ale něco na nich nesedí. Hledání těch rozdílů bere čas.',
        source: 'Stack Overflow Survey 2025',
    },
    {
        value: '19 %',
        description:
            'o tolik byli zkušení vývojáři s AI pomalejší. Přitom čekali, že budou o pětinu rychlejší.',
        source: 'METR, řízená studie 2025',
    },
    {
        value: '82 %',
        description: 'firem mělo během půl roku vážný výpadek v produkci kvůli kódu od AI.',
        source: 'New Relic, State of AI Coding 2026',
    },
];

type PainPoint = {
    icon: LucideIcon;
    title: string;
    description: string;
    consequence: string;
};

export const onlineWorkshopPainPoints: PainPoint[] = [
    {
        icon: GitCompare,
        title: 'Který agent se hodí na co?',
        description:
            'Claude Code, Codex, Cursor, Copilot. Každý týden nový žebříček a někdo po tobě chce rozhodnutí, co pustit do týmu.',
            consequence: 'Vybíráš podle Twitteru místo podle vlastního repa.',
    },
    {
        icon: Clock,
        title: 'Zrychluje tě agent, nebo brzdí?',
        description:
            'Na malém tasku letí. U většího repa ztratí celek a začne kopírovat.',
        consequence: 'Bez měření nevíš, jestli ti pomáhá, nebo bere čas.',
    },
    {
        icon: Bug,
        title: 'Kód z AI je z půlky rozbitý',
        description:
            'Vypadá hotově, testy projdou. Jenže agent si je cestou upravil, aby prošly. Problém se ukáže až v produkci.',
        consequence: 'Opravit skoro hotové bývá dražší než napsat od nuly.',
    },
    {
        icon: Layers,
        title: 'Rychle napsáno, pozdě zaplaceno',
        description:
            'Za poslední rok jste nasekali hromadu AI kódu. Teď se ozývají duplicity, migrace, bezpečnost a rozbité integrace.',
        consequence: 'Už nestavíte. Jen se snažíte nic nerozbít.',
    },
];

type FitCard = {
    title: string;
    description: string;
    isPositive: boolean;
};

export const onlineWorkshopFitCards: FitCard[] = [
    {
        title: 'Hodí se to pro tebe, pokud',
        description:
            'jsi tech lead, CTO, senior dev, product manager nebo owner a tvůj tým už používá Claude Code, Cursor, Copilot, Codex, Cline nebo Gemini.',
        isPositive: true,
    },
    {
        title: 'Není to pro tebe, pokud',
        description:
            's AI vývojem ještě nezačínáš, nebo čekáš, že to někdo nasadí a vyřeší za tebe. Ukážeme ti, jak na to se svým týmem.',
        isPositive: false,
    },
];

type ContentItem = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export const onlineWorkshopContentItems: ContentItem[] = [
    {
        icon: Workflow,
        title: 'Co agentovi zadat, kdy a jak',
        description: 'Nejdřív plán, potom kód. Zadání, které vyjde napoprvé, místo tří kol oprav.',
    },
    {
        icon: GitPullRequest,
        title: 'Od zadání k merge',
        description: 'Jak udržet agentovi kontext i na velkém repu.',
    },
    {
        icon: Bot,
        title: 'Claude Code, Codex, nebo Cursor?',
        description: 'Co se hodí na jakou úlohu podle tří let práce na reálných projektech, ne podle internetových žebříčků.',
    },
    {
        icon: ShieldCheck,
        title: 'Jak udržet rozbitý kód na uzdě',
        description: 'Malé PR, testy a typy jako pojistka. Jak poznat, že agent kecá, dřív než kód pustíš do produkce.',
    },
    {
        icon: Sparkles,
        title: 'Jak z agenta dostat víc',
        description: 'Jak pracovat s kontextem, aby ti nedošel v půlce úkolu. Kde je strop nástroje a kde tvůj setup.',
    },
    {
        icon: MessageSquareText,
        title: 'Živé otázky a odpovědi',
        description: 'Vezmi vlastní problém z projektu. Pro ty, kteří zůstanou do konce, to bývá nejpraktičtější část workshopu.',
    },
];

export type OnlineWorkshopScheduleItem = {
    time: string;
    title: string;
    description: string;
    icon: LucideIcon;
    badgeClassName: string;
};

export const onlineWorkshopScheduleItems: OnlineWorkshopScheduleItem[] = [
    {
        time: '19:00 – 19:10',
        title: 'Proč agenti na velkých projektech selhávají',
        description: 'Nástroj za to nemůže sám. Rozhoduje setup. Ukážeme, kde se to láme.',
        icon: Sparkles,
        badgeClassName: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    },
    {
        time: '19:10 – 19:40',
        title: 'Živé demo na skutečném repu',
        description: 'Jedna feature od issue po hotové PR. Sdílená obrazovka, bez sestřihu.',
        icon: Code2,
        badgeClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },
    {
        time: '19:40 – 19:50',
        title: 'Workflow a pravidla pro tým',
        description: 'Postup, který můžeš nasadit hned další den.',
        icon: NotebookTabs,
        badgeClassName: 'bg-amber-50 text-amber-700 ring-amber-200',
    },
    {
        time: '19:50 – 20:00',
        title: 'Otázky a odpovědi živě',
        description: 'Přines problém z projektu a společně ho rozebereme.',
        icon: MessageSquareText,
        badgeClassName: 'bg-rose-50 text-rose-700 ring-rose-200',
    },
];

export const onlineWorkshopFaqs: FAQ[] = [
    {
        question: 'Kolik to stojí?',
        answer: <p>Nic. Workshop je zdarma.</p>,
    },
    {
        question: 'Bude záznam?',
        answer: (
            <p>
                Záznam pošleme jen registrovaným a bude dostupný 48 hodin. Naživo si ale odneseš nejvíc, hlavně z
                Q&amp;A.
            </p>
        ),
    },
    {
        question: 'Musím používat Claude Code?',
        answer: (
            <p>
                Nemusíš. Workflow, který ukážeme, funguje s Cursorem, Copilotem, Codexem i dalšími nástroji. Claude
                Code používáme v demu.
            </p>
        ),
    },
    {
        question: 'Budete něco prodávat?',
        answer: (
            <p>
                Na konci ukážeme navazující placený workshop{' '}
                <Link
                    href={AI_SUPERVIZE_MINI_PATH}
                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                >
                    AI Supervize Mini
                </Link>
                . Zabere to pár minut na konci. Zbytek je samotný workshop.
            </p>
        ),
    },
    {
        question: 'Jak se připojím?',
        answer: (
            <p>
                Odkaz ti pošleme e-mailem den předem i hodinu předem. Když uvedeš telefon, přijde ti i SMS, aby ti
                workshop neutekl.
            </p>
        ),
    },
];
