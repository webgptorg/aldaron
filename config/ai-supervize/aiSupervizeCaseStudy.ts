import type { CaseStudySectionProps } from '@/components/case-study-section';
import { Activity, Bot, Gauge, ShieldCheck } from 'lucide-react';

export const aiSupervizeCaseStudy: Omit<CaseStudySectionProps, 'id'> = {
    eyebrow: 'Ukázková case study',
    title: 'Jak může vypadat výsledek AI Supervize v praxi',
    description:
        'Níže je záměrně modelový příklad. Struktura, pořadí metrik i způsob prezentace odpovídají tomu, co na podobné stránce obvykle funguje nejlépe. Konkrétní čísla si potom jednoduše přepíšete za reálná.',
    company: 'B2B SaaS produkt • 22členný produktový tým • TypeScript / Next.js / Node.js',
    summary:
        'Tým chtěl zrychlit delivery pomocí AI, ale používal ji každý jinak. Chyběla pravidla, schválené workflow, jednotné prompty i způsob měření dopadu. Po AI Supervizi vznikl jeden jasný systém pro vývojáře, tech leady i code review.',
    note: 'Ukázková data – nahraďte prosím reálnou case study po doplnění přesných výsledků.',
    snapshot: [
        { label: 'Segment', value: 'B2B SaaS s interním vývojovým týmem' },
        { label: 'Rozsah', value: '3 squady, 16 developerů, 4 PM/QA/lead role' },
        { label: 'Cíl', value: 'Zrychlit delivery bez růstu rizika a chaosu' },
    ],
    metrics: [
        {
            label: 'Lead time do merge',
            before: '6,5 dne',
            after: '3,8 dne',
            change: '-42 %',
            description: 'První metrika na stránce: nejrychleji komunikuje business dopad a zkrácení delivery cyklu.',
            icon: Gauge,
        },
        {
            label: 'Rework po review',
            before: '3,1 kola',
            after: '1,7 kola',
            change: '-45 %',
            description:
                'Druhá metrika potvrzuje, že nejde jen o rychlost, ale i o kvalitnější změny a lepší zadávání AI.',
            icon: Activity,
        },
        {
            label: 'Adopce schváleného AI workflow',
            before: '14 % týmu',
            after: '76 % týmu',
            change: '+62 p. b.',
            description: 'Třetí metrika ukazuje, že změna nezůstala u jednoho nadšence, ale rozšířila se napříč týmem.',
            icon: Bot,
        },
        {
            label: 'Tasky pokryté playbookem',
            before: '0 %',
            after: '68 %',
            change: '+68 p. b.',
            description: 'Čtvrtá metrika doplňuje governance: AI je zavedená jako řízený proces, ne improvizace.',
            icon: ShieldCheck,
        },
    ],
    challengeItems: [
        'Každý developer používal jiné nástroje, prompty a pravidla pro práci s AI.',
        'Tech leadi neviděli, kde AI reálně pomáhá a kde naopak zvyšuje rework.',
        'Chyběla dohoda, co je bezpečné posílat do externích nástrojů a co už ne.',
        'Tým chtěl AI rozšířit, ale neměl společný rollout plan ani měřitelné cíle.',
    ],
    interventionItems: [
        'Vytvořili jsme AI adoption playbook rozdělený podle typů úkolů a úrovně rizika.',
        'Nastavili jsme schválený tool & model matrix pro návrh, implementaci, review a dokumentaci.',
        'Doplnili jsme repo/PR šablony, checklisty a konkrétní pravidla pro práci s kontextem a daty.',
        'Postavili jsme 30/60/90 rollout plan včetně pilotu, metrik a způsobu pravidelného vyhodnocení.',
    ],
    timeline: [
        {
            period: '30 dní',
            title: 'Audit, pilot a první guardraily',
            description: 'Zmapování workflow, rizik a use-caseů. Výběr pilotních scénářů a zavedení prvních pravidel.',
        },
        {
            period: '60 dní',
            title: 'Šablony, review a rozšíření do squadů',
            description: 'Zavedení playbooku, PR/repo šablon a schváleného postupu pro nejčastější typy práce s AI.',
        },
        {
            period: '90 dní',
            title: 'Měření dopadu a další optimalizace',
            description:
                'Vyhodnocení přínosu, úpravy workflow podle reality týmu a rozhodnutí o dalším follow-up režimu.',
        },
    ],
    quote: {
        text: 'Poprvé jsme neměli pocit, že AI ve vývoji každý používá po svém. Dostali jsme společný systém, díky kterému šla rychlost nahoru a chaos dolů.',
        author: 'CTO, ukázkový klient',
        role: 'doplníte jméno a firmu',
    },
    ctaText: 'Domluvit discovery workshop',
    ctaHref: '?modal=get-started',
};
