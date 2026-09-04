import { FAQ } from '@/components/faq-section';
import type { EventOccurrence } from '@/lib/events/eventOccurrence';
import {
    formatEventOccurrenceCapacitySummary,
    formatEventOccurrenceLocationSummary,
    formatEventOccurrencePriceSummary,
    formatEventOccurrenceSummaries,
} from '@/lib/events/eventSummary';
import { Bot, Code2, GitPullRequest, ShieldCheck, TestTube2, Workflow } from 'lucide-react';
import Link from 'next/link';

const AUDIENCE_HERO_BULLET = 'Pro vývoj v TypeScriptu a JavaScriptu';

/**
 * What the hero promises about the published terms
 *
 * Note: Everything about a term is read from the administered terms, so a term added, moved, or withdrawn changes
 *       this page without a single line of copy being rewritten. A promise which has no term to be made about is left
 *       out rather than made up.
 */
export function createAiSupervizeMiniHeroBullets(occurrences: readonly EventOccurrence[]): readonly string[] {
    const locationSummary = formatEventOccurrenceLocationSummary(occurrences);
    const capacitySummary = formatEventOccurrenceCapacitySummary(occurrences);

    return [locationSummary, capacitySummary, AUDIENCE_HERO_BULLET].filter((heroBullet) => heroBullet !== '');
}

export const aiSupervizeMiniTerminalMetrics = [
    { metric: 'Nejasná zadání', before: 8, after: 3, unit: '×' },
    { metric: 'Ruční rework', before: 12, after: 6, unit: ' h' },
    { metric: 'Velikost PR', before: 900, after: 420, unit: ' ř.' },
    { metric: 'Regrese', before: 6, after: 2, unit: '/sprint' },
];

export const aiSupervizeMiniImpactMetrics = [
    {
        value: '3',
        suffix: ' týdny',
        label: 'průměrná návratnost investice',
    },
    {
        value: '20',
        suffix: ' %',
        label: 'průměrné zrychlení vývoje',
    },
    {
        value: '30',
        suffix: ' %',
        label: 'méně chyb v produkci',
    },
];

export const aiSupervizeMiniTakeaways = [
    {
        icon: Workflow,
        title: 'Workflow pro AI vývoj',
        description: 'Jak rozdělit práci od nápadu přes PRD, issue a branch až po merge, který jde zkontrolovat.',
    },
    {
        icon: Bot,
        title: 'Volba nástrojů a modelů',
        description: 'Kdy sáhnout po Codexu, Claude Code, Copilotu nebo Cursoru a kdy je čas vyměnit model.',
    },
    {
        icon: GitPullRequest,
        title: 'Git, PR a review',
        description: 'Jak držet změny malé a dohledatelné i ve chvíli, kdy většinu kódu píše AI.',
    },
    {
        icon: TestTube2,
        title: 'Testování a signály kvality',
        description:
            'Unit testy, e2e testy, typy v TypeScriptu a kontrolní body, které chytí regresi dřív než produkce.',
    },
    {
        icon: ShieldCheck,
        title: 'Rizika a bezpečnost',
        description:
            'Jak chytat chyby včas, co dělat, když se něco pokazí, a kde nastavit hranice pro data a oprávnění.',
    },
    {
        icon: Code2,
        title: 'Code quality v době AI',
        description: 'Jak poznat, že AI produkt zrychluje, a ne jen vyrábí kód, který za půl roku nikdo neudrží.',
    },
];

/**
 * One list of every published term, which is how an answer names the terms it is about
 */
function EventOccurrenceList({ occurrences }: { readonly occurrences: readonly EventOccurrence[] }) {
    return (
        <ul className="list-disc space-y-1 pl-5">
            {formatEventOccurrenceSummaries(occurrences).map((occurrenceSummary) => (
                <li key={occurrenceSummary}>{occurrenceSummary}</li>
            ))}
        </ul>
    );
}

/**
 * The questions visitors ask about the workshop, answered for the terms which are really published
 *
 * Note: An answer about the terms reads them from the administration, so nothing here can disagree with the terms the
 *       registration form offers.
 */
export function createAiSupervizeMiniFaqs(occurrences: readonly EventOccurrence[]): FAQ[] {
    const capacitySummary = formatEventOccurrenceCapacitySummary(occurrences);
    const priceSummary = formatEventOccurrencePriceSummary(occurrences);

    return [
        {
            question: 'V čem se AI Supervize Mini liší od běžného školení nebo workshopu o AI?',
            answer: (
                <p>
                    Běžné školení vás naučí ovládat jeden nástroj. Tady jde o celý proces vývoje s AI. Kde vznikají
                    rizika, co a jak testovat, jak verzovat, kde hlídat kvalitu kódu a podle čeho vybírat nástroje.
                    Odnesete si způsob přemýšlení, ne návod k jednomu produktu.
                </p>
            ),
        },
        {
            question: 'Je to školení Claude Code?',
            answer: (
                <p>
                    Ne. Claude Code se nejspíš objeví, ale workshop není produktové školení jednoho vendoru. Chceme,
                    abyste po něm sami poznali, který nástroj, model a workflow se hodí na jakou práci a kde se
                    nevyplatí riskovat.
                </p>
            ),
        },
        {
            question: 'Co si z workshopu odnesu?',
            answer: (
                <div className="space-y-3">
                    <p>
                        Hlavně způsob, jak nad AI vývojem přemýšlet. A k tomu konkrétní věci, které použijete hned druhý
                        den.
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>Jak předat AI víc práce a přestat nad ní stát s rukou na klávesnici.</li>
                        <li>Jak chyby a průšvihy odchytit co nejdřív.</li>
                        <li>Jak práci pro AI rozdělit do PRD, issue a PR, které jde zkontrolovat.</li>
                        <li>Kdy přejít na jiný nástroj nebo model.</li>
                        <li>Tipy pro Git, unit testy, e2e testy, typy v TypeScriptu a code review.</li>
                    </ul>
                </div>
            ),
        },
        {
            question: 'Jak dlouho workshop trvá a jak je strukturovaný?',
            answer: (
                <div className="space-y-3">
                    <p>
                        Den je rozdělený do bloků. Mindset a rizika, tooling, PRD a zadávání práce AI, verzování,
                        testování, code review a měření dopadu. Přesné časy máte u každého vypsaného termínu:
                    </p>
                    <EventOccurrenceList occurrences={occurrences} />
                </div>
            ),
        },
        {
            question: 'Pro koho je workshop vhodný?',
            answer: (
                <p>
                    Pro vývojáře a produkťáky, kteří dělají v TypeScriptu nebo JavaScriptu, případně na webových a
                    aplikačních produktech obecně. AI expert být nemusíte. Když už jste ale nějaký AI nástroj zkusili,
                    vytěžíte z toho dne víc.
                </p>
            ),
        },
        {
            question: 'Může firma poslat víc lidí najednou?',
            answer: (
                <div className="space-y-3">
                    <p>
                        Ano. Ve formuláři si zvolíte počet účastníků podle toho, kolik míst v termínu zbývá. Kapacita
                        jednotlivých termínů: {capacitySummary}. Skupina zůstává malá, takže se dostane na konkrétní
                        dotazy i na zpětnou vazbu.
                    </p>
                    <p>
                        Pokud chcete poslat celý tým, máme <Link href="/ai-supervize">AI Supervizi i pro firmy</Link>.
                        Obsah a formát tam skládáme na míru tomu, co tým opravdu řeší.
                    </p>
                </div>
            ),
        },
        {
            question: 'Co si mám přinést?',
            answer: (
                <p>
                    Notebook a ideálně jeden konkrétní produkt, repozitář nebo workflow, na kterém chcete AI vývoj
                    posunout. Citlivý kód sdílet nemusíte. Stačí popsat situaci a místa, kde vám AI dnes pomáhá nebo
                    naopak selhává.
                </p>
            ),
        },
        {
            question: `Proč je cena ${priceSummary}, když jiné kurzy a školení o AI bývají levnější?`,
            answer: (
                <div className="space-y-3">
                    <p>
                        Levné kurzy o AI existují a většinou vás naučí ovládat jeden nástroj. Tady platíte za den v malé
                        skupině, kde se řeší vaše situace, vaše rizika, vaše testy a vaše code review. Online termín je
                        levnější díky formátu a kratšímu programu. Ceny jsou konečné, nejsme plátci DPH.
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>
                            Workshop vede Pavol Hejný. 15+ let vývoje a produktového managementu, z toho 3 roky
                            každodenní práce s AI nástroji na reálných projektech.
                        </li>
                        <li>Hodně kurzů o AI vedou lidé, kteří s AI reálně nevyvíjejí. Na obsahu je to poznat.</li>
                        <li>
                            Místo přednášky se pracuje na příkladech a cvičeních, se zpětnou vazbou na to, co řešíte vy.
                        </li>
                    </ul>
                </div>
            ),
        },
    ];
}
