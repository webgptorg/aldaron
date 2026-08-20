import { AI_SUPERVIZE_MINI_WEBINAR_FOLLOW_UP_PATH } from '@/businesses/ai-supervize-mini/config';
import { onlineWorkshopConfig } from '@/businesses/online-workshop/config';
import type { FAQ } from '@/components/faq-section';
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

export const onlineWorkshopHeroBullets = [
    onlineWorkshopConfig.date.durationLabel,
    'Zdarma, naživo',
    'TypeScript · Claude Code · Codex · Cursor',
];

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
            'vývojářů říká, že řešení od AI jsou skoro správná, ale ne úplně. Právě to dohledávání žere čas.',
        source: 'Stack Overflow Survey 2025',
    },
    {
        value: '19 %',
        description:
            'o tolik byli zkušení vývojáři s AI pomalejší. Sami přitom věřili, že jsou o pětinu rychlejší.',
        source: 'METR, řízená studie 2025',
    },
    {
        value: '82 %',
        description: 'firem mělo za půl roku vážný výpadek v produkci kvůli kódu od AI.',
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
        title: 'Který agent je vlastně na co?',
        description:
            'Claude Code, Codex, Cursor, Copilot. Každý týden nový žebříček a ty máš rozhodnout, co pustíš do týmu a na jakou práci.',
        consequence: 'Vybíráš podle Twitteru, ne podle svého repa.',
    },
    {
        icon: Clock,
        title: 'Šetří ti agent čas, nebo ho žere?',
        description:
            'Na malém tasku letí. Nad určitou velikost repa přestane vidět celek a místo hledání začne duplikovat.',
        consequence: 'Bez měření nepoznáš, jestli tě zrychluje, nebo brzdí.',
    },
    {
        icon: Bug,
        title: 'Kód z AI je z půlky rozbitý',
        description:
            'Vypadá hotově, testy projdou. Jenže agent si je cestou upravil, aby prošly. Padne to až v produkci.',
        consequence: 'Opravit skoro hotové bývá dražší než napsat od nuly.',
    },
    {
        icon: Layers,
        title: 'Napsáno rychle, placeno později',
        description:
            'Za poslední rok jste nasekali hromadu AI kódu. Teď se hlásí duplicity, migrace, bezpečnost a rozbité integrace.',
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
        title: 'Je to pro tebe, pokud',
        description:
            'jsi tech lead, CTO, senior dev, product manager nebo owner a tvůj tým už používá Claude Code, Cursor, Copilot, Codex, Cline nebo Gemini.',
        isPositive: true,
    },
    {
        title: 'Není to pro tebe, pokud',
        description:
            's AI vývojem ještě nezačínáš, nebo čekáš, že to někdo nasadí a vyřeší za tebe. Ukážeme, jak to zvládneš sám se svým týmem.',
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
        title: 'Co agentovi napsat, kdy a jak',
        description: 'Nejdřív plán, teprve pak kód. Zadání, po kterém to dopadne napoprvé, místo tří kol oprav.',
    },
    {
        icon: GitPullRequest,
        title: 'Celé flow od zadání po merge',
        description: 'Jak si postavit postup, ve kterém agent neztratí kontext ani na velkém repu.',
    },
    {
        icon: Bot,
        title: 'Kdy Claude Code, kdy Codex, kdy Cursor',
        description: 'Co na jakou úlohu, podle tří let na reálných projektech, ne podle žebříčků z internetu.',
    },
    {
        icon: ShieldCheck,
        title: 'Mantinely, aby kód nebyl rozbitý',
        description: 'Malé PR, testy a typy jako pojistka. Jak poznat, že agent kecá, dřív než to jde do produkce.',
    },
    {
        icon: Sparkles,
        title: 'Jak z agenta vytáhnout maximum',
        description: 'Práce s kontextem, aby ti nedošel v půlce úkolu. Kde je strop nástroje a kde tvůj setup.',
    },
    {
        icon: MessageSquareText,
        title: 'Q&A naživo',
        description: 'Přines vlastní problém z projektu. Nejužitečnější část celého workshopu pro ty, co zůstanou do konce.',
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
        title: 'Proč agenti selhávají na velkých projektech',
        description: 'Není to nástrojem, ale setupem. Ukážeme, kde přesně se to láme.',
        icon: Sparkles,
        badgeClassName: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    },
    {
        time: '19:10 – 19:40',
        title: 'Živé demo na reálném repu',
        description: 'Reálná feature od issue po hotové PR. Sdílená obrazovka, žádný sestřih.',
        icon: Code2,
        badgeClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    },
    {
        time: '19:40 – 19:50',
        title: 'Workflow a pravidla pro tvůj tým',
        description: 'Konkrétní postup, který nasadíš hned druhý den.',
        icon: NotebookTabs,
        badgeClassName: 'bg-amber-50 text-amber-700 ring-amber-200',
    },
    {
        time: '19:50 – 20:00',
        title: 'Q&A naživo',
        description: 'Přines vlastní problém z projektu a rozebereme ho.',
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
                Záznam pošleme jen registrovaným a bude dostupný 48 hodin. Nejvíc si ale odneseš naživo, hlavně z
                Q&amp;A.
            </p>
        ),
    },
    {
        question: 'Musím používat Claude Code?',
        answer: (
            <p>
                Ne. Workflow, který ukážeme, funguje s Cursorem, Copilotem, Codexem i dalšími. Claude Code používáme
                v demu.
            </p>
        ),
    },
    {
        question: 'Budete něco prodávat?',
        answer: (
            <p>
                Na konci ukážeme navazující placený workshop{' '}
                <Link
                    href={AI_SUPERVIZE_MINI_WEBINAR_FOLLOW_UP_PATH}
                    className="font-semibold text-cyan-700 underline-offset-4 hover:underline"
                >
                    AI Supervize Mini
                </Link>
                . Zabere to pár minut na závěr, zbytek je čistý obsah.
            </p>
        ),
    },
    {
        question: 'Jak se připojím?',
        answer: (
            <p>
                Odkaz ti pošleme e-mailem den předem a hodinu předem. Když vyplníš telefon, pošleme i SMS, ať ti to
                neuteče.
            </p>
        ),
    },
];
